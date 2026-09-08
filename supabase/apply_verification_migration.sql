-- ============================================================================
-- VeerWell 2.0 — MHA Signup Verification Pipeline Schema
-- ============================================================================

-- 1. MHA CREDENTIALS (Source of Truth)
CREATE TABLE IF NOT EXISTS public.mha_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  designation   TEXT,
  department    TEXT,
  issued_at     DATE DEFAULT CURRENT_DATE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SIGNUP REQUESTS (Incoming Signup Attempts)
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id      TEXT NOT NULL,
  email           TEXT NOT NULL,
  full_name       TEXT,
  rank            TEXT,
  force           TEXT DEFAULT 'CRPF',
  unit            TEXT,
  role            TEXT DEFAULT 'personnel',
  department      TEXT,
  designation     TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  ai_status       TEXT CHECK (ai_status IN ('pending','clean','flagged','rejected')) DEFAULT 'pending',
  ai_reason       TEXT,
  ai_confidence   NUMERIC,
  review_status   TEXT CHECK (review_status IN ('awaiting_review','approved','rejected')) DEFAULT 'awaiting_review',
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT
);

-- 3. APPROVED USERS (Final Activated Accounts)
CREATE TABLE IF NOT EXISTS public.approved_users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_request_id UUID REFERENCES signup_requests(id) ON DELETE CASCADE,
  service_id        TEXT REFERENCES mha_credentials(service_id),
  email             TEXT NOT NULL,
  approved_at       TIMESTAMPTZ DEFAULT NOW(),
  approved_by       UUID REFERENCES auth.users(id)
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_mha_credentials_service_id ON public.mha_credentials(service_id);
CREATE INDEX IF NOT EXISTS idx_signup_requests_service_id ON public.signup_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_signup_requests_review_status ON public.signup_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_ai_status ON public.signup_requests(ai_status);
CREATE INDEX IF NOT EXISTS idx_approved_users_email ON public.approved_users(email);

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.mha_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_users ENABLE ROW LEVEL SECURITY;

-- mha_credentials: readable by service_role and authenticated reviewers
CREATE POLICY "Service role can read mha_credentials" ON public.mha_credentials
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Reviewers can read mha_credentials" ON public.mha_credentials
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('welfare_officer', 'commander', 'senior_command'))
  );

-- signup_requests: insertable by anon (for signup), readable by reviewers
CREATE POLICY "Anyone can insert signup requests" ON public.signup_requests
  FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Reviewers can read signup requests" ON public.signup_requests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('welfare_officer', 'commander', 'senior_command'))
  );

CREATE POLICY "Reviewers can update signup requests" ON public.signup_requests
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('welfare_officer', 'commander', 'senior_command'))
  );

-- approved_users: readable by service_role and authenticated users (own record)
CREATE POLICY "Service role can read approved_users" ON public.approved_users
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own approved record" ON public.approved_users
  FOR SELECT USING (auth.uid() = email);

-- 6. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_valid_service_id(p_service_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.mha_credentials
    WHERE service_id = p_service_id AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_mha_credential(p_service_id TEXT)
RETURNS TABLE (
  service_id TEXT,
  full_name TEXT,
  designation TEXT,
  department TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT mc.service_id, mc.full_name, mc.designation, mc.department, mc.is_active
  FROM public.mha_credentials mc
  WHERE mc.service_id = p_service_id;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.create_signup_request(
  p_service_id TEXT,
  p_email TEXT
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO public.signup_requests (service_id, email)
  VALUES (p_service_id, p_email)
  RETURNING id INTO v_request_id;
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  INSERT INTO public.approved_users (signup_request_id, service_id, email, approved_by)
  VALUES (p_request_id, v_request.service_id, v_request.email, p_reviewer_id)
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

-- 7. SEED DATA (MHA CREDENTIALS)
INSERT INTO public.mha_credentials (service_id, full_name, designation, department, is_active)
VALUES
  ('MHA-ANA-9001', 'Dr. Rajesh Kumar', 'Lead Behavioral Data Scientist', 'MHA CAPF HQ', TRUE),
  ('MHA-ANA-9002', 'Dr. Priya Sharma', 'Senior Research Officer', 'MHA CAPF HQ', TRUE),
  ('MHA-ANA-9104', 'Pooja Deshmukh', 'Lead Behavioral Scientist', 'HQ Directorate General (People Intelligence)', TRUE),
  ('CRPF-CMD-7801', 'Col. Devendra Singh Rathore', 'Commandant / CO', 'Operations', TRUE),
  ('CRPF-MED-8492', 'Dr. Aryan Verma', 'Chief Medical & Welfare Officer', 'Healthcare & Field', TRUE),
  ('CRPF-COBRA-1042', 'Insp. Vikramaditya Shrestha', 'Inspector (Field Command)', 'Special Operations', TRUE),
  ('BSF-SI-2241', 'SI Manoj Tiwari', 'Sub-Inspector', 'Operations', TRUE),
  ('ITBP-IG-1102', 'Lt. Gen. Ananya Krishnan', 'Inspector General (IG)', 'Northern Sector', TRUE),
  ('NSG-CMD-8817', 'Col. Arjun Raghuvanshi', 'Commandant — NSG Deputation', 'NSG Special Action Group', TRUE)
ON CONFLICT (service_id) DO NOTHING;
