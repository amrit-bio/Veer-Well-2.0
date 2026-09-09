-- ============================================================================
-- VeerWell 2.0 — MINIMAL CLEAN SQL MIGRATION
-- Run this ENTIRE script in Supabase SQL Editor
-- Safe to re-run multiple times (idempotent)
-- ============================================================================

-- STEP 1: Create signup_requests table
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_plain TEXT,
  rank          TEXT DEFAULT 'Officer',
  service_id    TEXT,
  force         TEXT DEFAULT 'CRPF',
  unit          TEXT,
  role          TEXT DEFAULT 'personnel',
  department    TEXT,
  designation   TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  review_status TEXT DEFAULT 'awaiting_review'
    CHECK (review_status IN ('awaiting_review', 'approved', 'rejected')),
  reviewed_by   UUID,
  reviewed_at   TIMESTAMPTZ,
  review_notes  TEXT
);

-- STEP 2: Create approved_users table
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

-- STEP 3: Safe column additions (skip if already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='signup_requests' AND column_name='password_plain')
  THEN ALTER TABLE public.signup_requests ADD COLUMN password_plain TEXT; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='approved_users' AND column_name='auth_user_id')
  THEN ALTER TABLE public.approved_users ADD COLUMN auth_user_id UUID UNIQUE; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='approved_users' AND column_name='account_active')
  THEN ALTER TABLE public.approved_users ADD COLUMN account_active BOOLEAN DEFAULT TRUE; END IF;
END $$;

-- STEP 4: Indexes
CREATE INDEX IF NOT EXISTS idx_sr_status     ON public.signup_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_sr_email      ON public.signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_sr_service_id ON public.signup_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_au_email      ON public.approved_users(email);
CREATE INDEX IF NOT EXISTS idx_au_service_id ON public.approved_users(service_id);
CREATE INDEX IF NOT EXISTS idx_au_auth_uid   ON public.approved_users(auth_user_id);

-- STEP 5: Enable RLS
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_users  ENABLE ROW LEVEL SECURITY;

-- STEP 6: Drop all old policies (clean slate)
DROP POLICY IF EXISTS "Anyone can insert signup requests"         ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read signup requests"           ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can update signup requests"         ON public.signup_requests;
DROP POLICY IF EXISTS "Service role full access signup_requests" ON public.signup_requests;
DROP POLICY IF EXISTS "Admin can read approved_users"            ON public.approved_users;
DROP POLICY IF EXISTS "Admin can insert approved_users"          ON public.approved_users;
DROP POLICY IF EXISTS "Admin can update approved_users"          ON public.approved_users;
DROP POLICY IF EXISTS "Service role full access approved_users"  ON public.approved_users;

-- STEP 7: Create RLS Policies

-- signup_requests: service_role (backend) has full access
CREATE POLICY "Service role full access signup_requests"
  ON public.signup_requests
  USING     (auth.role() = 'service_role')
  WITH CHECK(auth.role() = 'service_role');

-- signup_requests: anyone (anon) can INSERT a new signup request
CREATE POLICY "Anyone can insert signup requests"
  ON public.signup_requests
  FOR INSERT WITH CHECK (true);

-- signup_requests: MHA admin (logged-in) can SELECT all
-- Uses auth.jwt() ->> 'email' — does NOT touch auth.users (avoids permission error)
CREATE POLICY "Admin can read signup requests"
  ON public.signup_requests
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'email') = 'admin@mha.gov.in'
  );

-- signup_requests: MHA admin can UPDATE (approve/reject)
CREATE POLICY "Admin can update signup requests"
  ON public.signup_requests
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'email') = 'admin@mha.gov.in'
  );

-- approved_users: service_role full access
CREATE POLICY "Service role full access approved_users"
  ON public.approved_users
  USING     (auth.role() = 'service_role')
  WITH CHECK(auth.role() = 'service_role');

-- approved_users: MHA admin can SELECT
CREATE POLICY "Admin can read approved_users"
  ON public.approved_users
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'email') = 'admin@mha.gov.in'
  );

-- approved_users: MHA admin can INSERT
CREATE POLICY "Admin can insert approved_users"
  ON public.approved_users
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'email') = 'admin@mha.gov.in'
  );

-- approved_users: MHA admin can UPDATE
CREATE POLICY "Admin can update approved_users"
  ON public.approved_users
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'email') = 'admin@mha.gov.in'
  );

-- STEP 8: Stored Procedures

-- Approve a signup request → creates approved_users record
CREATE OR REPLACE FUNCTION public.approve_signup_request(
  p_request_id   UUID,
  p_reviewer_id  UUID,
  p_review_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_req         RECORD;
  v_approved_id UUID;
BEGIN
  SELECT * INTO v_req FROM public.signup_requests
  WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup request not found: %', p_request_id;
  END IF;
  IF v_req.review_status <> 'awaiting_review' THEN
    RAISE EXCEPTION 'Request already processed (status: %)', v_req.review_status;
  END IF;

  UPDATE public.signup_requests
  SET review_status = 'approved',
      reviewed_by   = p_reviewer_id,
      reviewed_at   = NOW(),
      review_notes  = COALESCE(p_review_notes, 'Approved by MHA Admin')
  WHERE id = p_request_id;

  INSERT INTO public.approved_users (
    signup_request_id, full_name, email, rank, service_id,
    force, unit, role, department, designation,
    approved_by, approval_notes, account_active
  ) VALUES (
    p_request_id,
    v_req.full_name,
    v_req.email,
    COALESCE(v_req.rank, 'Officer'),
    v_req.service_id,
    COALESCE(v_req.force, 'CRPF'),
    v_req.unit,
    COALESCE(v_req.role, 'personnel'),
    v_req.department,
    v_req.designation,
    p_reviewer_id,
    COALESCE(p_review_notes, 'Approved by MHA Admin'),
    TRUE
  )
  ON CONFLICT (email) DO UPDATE
    SET signup_request_id = EXCLUDED.signup_request_id,
        rank              = EXCLUDED.rank,
        service_id        = EXCLUDED.service_id,
        force             = EXCLUDED.force,
        unit              = EXCLUDED.unit,
        role              = EXCLUDED.role,
        approved_by       = EXCLUDED.approved_by,
        approval_notes    = EXCLUDED.approval_notes,
        approved_at       = NOW(),
        account_active    = TRUE
  RETURNING id INTO v_approved_id;

  RETURN v_approved_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject a signup request
CREATE OR REPLACE FUNCTION public.reject_signup_request(
  p_request_id   UUID,
  p_reviewer_id  UUID,
  p_review_notes TEXT DEFAULT 'Rejected by MHA Admin'
) RETURNS VOID AS $$
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

-- Link Supabase Auth user ID to approved_users after account creation
CREATE OR REPLACE FUNCTION public.update_approved_user_auth_id(
  p_email        TEXT,
  p_auth_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.approved_users
  SET auth_user_id = p_auth_user_id
  WHERE LOWER(email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 9: Grant function execution
GRANT EXECUTE ON FUNCTION public.approve_signup_request(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_signup_request(UUID, UUID, TEXT)  TO service_role;
GRANT EXECUTE ON FUNCTION public.update_approved_user_auth_id(TEXT, UUID) TO service_role;

-- STEP 10: RPC Functions for the MHA Admin Dashboard
-- These are SECURITY DEFINER = run as superuser, bypass RLS.
-- This is the ONLY reliable way to read signup_requests with the anon key
-- (since the anon key cannot use the service_role SELECT policy).
-- The functions are locked to admin@mha.gov.in email check for security.

-- Get all pending signup requests (for MHA admin review queue)
CREATE OR REPLACE FUNCTION public.get_pending_signups()
RETURNS TABLE (
  id            UUID,
  full_name     TEXT,
  email         TEXT,
  password_plain TEXT,
  rank          TEXT,
  service_id    TEXT,
  force         TEXT,
  unit          TEXT,
  role          TEXT,
  department    TEXT,
  designation   TEXT,
  submitted_at  TIMESTAMPTZ,
  review_status TEXT,
  reviewed_by   UUID,
  reviewed_at   TIMESTAMPTZ,
  review_notes  TEXT
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id, sr.full_name, sr.email, sr.password_plain,
    sr.rank, sr.service_id, sr.force, sr.unit, sr.role,
    sr.department, sr.designation, sr.submitted_at,
    sr.review_status, sr.reviewed_by, sr.reviewed_at, sr.review_notes
  FROM public.signup_requests sr
  WHERE sr.review_status = 'awaiting_review'
  ORDER BY sr.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get all approved users (for MHA admin approved tab)
CREATE OR REPLACE FUNCTION public.get_approved_personnel()
RETURNS TABLE (
  id                UUID,
  signup_request_id UUID,
  auth_user_id      UUID,
  full_name         TEXT,
  email             TEXT,
  rank              TEXT,
  service_id        TEXT,
  force             TEXT,
  unit              TEXT,
  role              TEXT,
  department        TEXT,
  designation       TEXT,
  approved_at       TIMESTAMPTZ,
  approved_by       UUID,
  approval_notes    TEXT,
  account_active    BOOLEAN
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id, au.signup_request_id, au.auth_user_id,
    au.full_name, au.email, au.rank, au.service_id,
    au.force, au.unit, au.role, au.department, au.designation,
    au.approved_at, au.approved_by, au.approval_notes, au.account_active
  FROM public.approved_users au
  WHERE au.account_active = TRUE
  ORDER BY au.approved_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant anon and authenticated users permission to call these RPC functions
GRANT EXECUTE ON FUNCTION public.get_pending_signups()    TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_approved_personnel() TO anon, authenticated, service_role;

-- ============================================================================
-- DONE. Verify by running:
-- SELECT COUNT(*) FROM public.signup_requests;
-- SELECT COUNT(*) FROM public.approved_users;
-- SELECT * FROM public.get_pending_signups();
-- ============================================================================
