-- ============================================================================
-- VeerWell 2.0 — Public Signup + Single Admin Review Schema
-- ============================================================================
-- Flow:
-- 1. Public user signs up -> stored in signup_requests as awaiting_review
-- 2. Single MHA admin reviews queue -> approves/rejects
-- 3. On approve -> creates Supabase Auth user + approved_users record
-- ============================================================================

-- 1. SIGNUP REQUESTS
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  password_hash   TEXT,
  rank            TEXT DEFAULT 'Officer',
  service_id      TEXT,
  force           TEXT DEFAULT 'CRPF',
  unit            TEXT,
  role            TEXT DEFAULT 'personnel',
  department      TEXT,
  designation     TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  review_status   TEXT CHECK (review_status IN ('awaiting_review','approved','rejected')) DEFAULT 'awaiting_review',
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT
);

-- 2. APPROVED USERS
CREATE TABLE IF NOT EXISTS public.approved_users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_request_id UUID REFERENCES signup_requests(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  rank              TEXT DEFAULT 'Officer',
  service_id        TEXT,
  force             TEXT DEFAULT 'CRPF',
  unit              TEXT,
  role              TEXT DEFAULT 'personnel',
  department        TEXT,
  designation       TEXT,
  approved_at       TIMESTAMPTZ DEFAULT NOW(),
  approved_by       UUID REFERENCES auth.users(id)
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_signup_requests_review_status ON public.signup_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_email ON public.signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_approved_users_email ON public.approved_users(email);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Anyone can insert signup requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read signup requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can update signup requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read approved_users" ON public.approved_users;

-- Anyone can insert a signup request (public signup)
CREATE POLICY "Anyone can insert signup requests" ON public.signup_requests
  FOR INSERT WITH CHECK (true);

-- Admin can read all signup requests
CREATE POLICY "Admin can read signup requests" ON public.signup_requests
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- Admin can update signup requests
CREATE POLICY "Admin can update signup requests" ON public.signup_requests
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- Admin can read approved users
CREATE POLICY "Admin can read approved_users" ON public.approved_users
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@mha.gov.in')
  );

-- 5. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.approve_signup_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request RECORD;
  v_approved_id UUID;
BEGIN
  SELECT * INTO v_request FROM public.signup_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup request not found: %', p_request_id;
  END IF;
  IF v_request.review_status != 'awaiting_review' THEN
    RAISE EXCEPTION 'Signup request is not awaiting review: %', v_request.review_status;
  END IF;
  UPDATE public.signup_requests
  SET review_status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = NOW(),
      review_notes = p_review_notes
  WHERE id = p_request_id;
  INSERT INTO public.approved_users (
    signup_request_id, full_name, email, rank, service_id,
    force, unit, role, department, designation, approved_by
  ) VALUES (
    p_request_id, v_request.full_name, v_request.email, v_request.rank, v_request.service_id,
    v_request.force, v_request.unit, v_request.role, v_request.department, v_request.designation, p_reviewer_id
  )
  RETURNING id INTO v_approved_id;
  RETURN v_approved_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_signup_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.signup_requests
  SET review_status = 'rejected',
      reviewed_by = p_reviewer_id,
      reviewed_at = NOW(),
      review_notes = p_review_notes
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
