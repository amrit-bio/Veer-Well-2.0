-- ============================================================================
-- VeerWell 2.0 — Public Signup + Single Admin Review Schema
-- ============================================================================
-- Flow:
-- 1. Public user signs up -> stored in signup_requests as awaiting_review
-- 2. Single MHA admin reviews queue -> approves/rejects
-- 3. On approve -> creates Supabase Auth user + approved_users record + profiles record
-- 4. Approved user can then login with email/service_id + password
-- ============================================================================

-- 1. SIGNUP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  password_hash   TEXT,
  password_plain  TEXT,
  rank            TEXT DEFAULT 'Officer',
  service_id      TEXT,
  force           TEXT DEFAULT 'CRPF',
  unit            TEXT,
  role            TEXT DEFAULT 'personnel',
  department      TEXT,
  designation     TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  review_status   TEXT CHECK (review_status IN ('awaiting_review','approved','rejected')) DEFAULT 'awaiting_review',
  reviewed_by     UUID,
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT
);

-- Safe: add password_plain column if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'signup_requests' AND column_name = 'password_plain'
  ) THEN
    ALTER TABLE public.signup_requests ADD COLUMN password_plain TEXT;
  END IF;
END $$;

-- 2. APPROVED USERS TABLE
-- Source of truth: every approved personnel record lives here
CREATE TABLE IF NOT EXISTS public.approved_users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_request_id UUID REFERENCES public.signup_requests(id) ON DELETE SET NULL,
  auth_user_id      UUID UNIQUE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  rank              TEXT DEFAULT 'Officer',
  service_id        TEXT,
  force             TEXT DEFAULT 'CRPF',
  unit              TEXT,
  role              TEXT DEFAULT 'personnel',
  department        TEXT,
  designation       TEXT,
  approved_at       TIMESTAMPTZ DEFAULT NOW(),
  approved_by       UUID,
  approval_notes    TEXT,
  account_active    BOOLEAN DEFAULT TRUE
);

-- Safe: add auth_user_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'approved_users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.approved_users ADD COLUMN auth_user_id UUID UNIQUE;
  END IF;
END $$;

-- Safe: add account_active if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'approved_users' AND column_name = 'account_active'
  ) THEN
    ALTER TABLE public.approved_users ADD COLUMN account_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_signup_requests_review_status ON public.signup_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_email        ON public.signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_signup_requests_service_id   ON public.signup_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_approved_users_email         ON public.approved_users(email);
CREATE INDEX IF NOT EXISTS idx_approved_users_service_id    ON public.approved_users(service_id);
CREATE INDEX IF NOT EXISTS idx_approved_users_auth_user_id  ON public.approved_users(auth_user_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_users  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Anyone can insert signup requests"         ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read signup requests"           ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can update signup requests"         ON public.signup_requests;
DROP POLICY IF EXISTS "Service role full access signup_requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read approved_users"            ON public.approved_users;
DROP POLICY IF EXISTS "Admin can insert approved_users"          ON public.approved_users;
DROP POLICY IF EXISTS "Admin can update approved_users"          ON public.approved_users;
DROP POLICY IF EXISTS "Service role full access approved_users"  ON public.approved_users;

-- Service role (backend) has unrestricted access
CREATE POLICY "Service role full access signup_requests" ON public.signup_requests
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access approved_users" ON public.approved_users
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Public can submit signup requests
CREATE POLICY "Anyone can insert signup requests" ON public.signup_requests
  FOR INSERT WITH CHECK (true);

-- MHA Admin can read signup requests
CREATE POLICY "Admin can read signup requests" ON public.signup_requests
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- MHA Admin can update signup requests
CREATE POLICY "Admin can update signup requests" ON public.signup_requests
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- MHA Admin can read approved users
CREATE POLICY "Admin can read approved_users" ON public.approved_users
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- MHA Admin can insert approved users
CREATE POLICY "Admin can insert approved_users" ON public.approved_users
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- MHA Admin can update approved users
CREATE POLICY "Admin can update approved_users" ON public.approved_users
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- 5. HELPER FUNCTIONS

-- approve_signup_request: Moves request to 'approved', inserts into approved_users
CREATE OR REPLACE FUNCTION public.approve_signup_request(
  p_request_id  UUID,
  p_reviewer_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request    RECORD;
  v_approved_id UUID;
BEGIN
  SELECT * INTO v_request FROM public.signup_requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup request not found: %', p_request_id;
  END IF;

  IF v_request.review_status != 'awaiting_review' THEN
    RAISE EXCEPTION 'Signup request is not awaiting review (status: %)', v_request.review_status;
  END IF;

  -- Mark as approved
  UPDATE public.signup_requests
  SET review_status = 'approved',
      reviewed_by   = p_reviewer_id,
      reviewed_at   = NOW(),
      review_notes  = COALESCE(p_review_notes, 'Approved by MHA Admin')
  WHERE id = p_request_id;

  -- Insert into approved_users (upsert on email to handle re-approvals)
  INSERT INTO public.approved_users (
    signup_request_id, full_name, email, rank, service_id,
    force, unit, role, department, designation,
    approved_by, approval_notes, account_active
  ) VALUES (
    p_request_id,
    v_request.full_name,
    v_request.email,
    COALESCE(v_request.rank, 'Officer'),
    v_request.service_id,
    COALESCE(v_request.force, 'CRPF'),
    v_request.unit,
    COALESCE(v_request.role, 'personnel'),
    v_request.department,
    v_request.designation,
    p_reviewer_id,
    COALESCE(p_review_notes, 'Approved by MHA Admin'),
    TRUE
  )
  ON CONFLICT (email) DO UPDATE
    SET signup_request_id = EXCLUDED.signup_request_id,
        full_name         = EXCLUDED.full_name,
        rank              = EXCLUDED.rank,
        service_id        = EXCLUDED.service_id,
        force             = EXCLUDED.force,
        unit              = EXCLUDED.unit,
        role              = EXCLUDED.role,
        department        = EXCLUDED.department,
        designation       = EXCLUDED.designation,
        approved_by       = EXCLUDED.approved_by,
        approval_notes    = EXCLUDED.approval_notes,
        approved_at       = NOW(),
        account_active    = TRUE
  RETURNING id INTO v_approved_id;

  RETURN v_approved_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reject_signup_request: Sets status to 'rejected'
CREATE OR REPLACE FUNCTION public.reject_signup_request(
  p_request_id   UUID,
  p_reviewer_id  UUID,
  p_review_notes TEXT DEFAULT 'Rejected by MHA Admin'
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.signup_requests
  SET review_status = 'rejected',
      reviewed_by   = p_reviewer_id,
      reviewed_at   = NOW(),
      review_notes  = COALESCE(p_review_notes, 'Rejected by MHA Admin')
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup request not found: %', p_request_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_approved_user_auth_id: Link approved_users row to Supabase Auth user after creation
CREATE OR REPLACE FUNCTION public.update_approved_user_auth_id(
  p_email       TEXT,
  p_auth_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.approved_users
  SET auth_user_id = p_auth_user_id
  WHERE LOWER(email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role only (backend uses service_role key)
GRANT EXECUTE ON FUNCTION public.approve_signup_request(UUID, UUID, TEXT)  TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_signup_request(UUID, UUID, TEXT)   TO service_role;
GRANT EXECUTE ON FUNCTION public.update_approved_user_auth_id(TEXT, UUID)  TO service_role;
