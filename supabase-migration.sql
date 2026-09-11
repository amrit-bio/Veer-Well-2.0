-- Supabase SQL Migration for VeerWell
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create profiles table (main user profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  rank TEXT,
  service_number TEXT UNIQUE,
  force TEXT DEFAULT 'CRPF',
  unit TEXT,
  role TEXT NOT NULL DEFAULT 'personnel',
  role_title TEXT,
  department TEXT,
  designation TEXT,
  anonymized_id TEXT UNIQUE,
  team_id TEXT,
  avatar TEXT,
  location TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  account_status TEXT DEFAULT 'PENDING_MHA_APPROVAL',
  mha_admin_id TEXT,
  mha_remarks TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON public.profiles
  USING (auth.jwt()->>'role' = 'service_role');

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2. Create signup_requests table (for MHA approval workflow)
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_plain TEXT,
  rank TEXT,
  service_id TEXT,
  force TEXT,
  unit TEXT,
  role TEXT DEFAULT 'personnel',
  department TEXT,
  designation TEXT,
  review_status TEXT DEFAULT 'awaiting_review',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT
);

ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage signup_requests" ON public.signup_requests
  USING (auth.jwt()->>'role' = 'service_role');

GRANT ALL ON public.signup_requests TO service_role;

-- 3. Create approved_users table
CREATE TABLE IF NOT EXISTS public.approved_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_request_id UUID REFERENCES public.signup_requests(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  rank TEXT,
  service_id TEXT,
  force TEXT,
  unit TEXT,
  role TEXT DEFAULT 'personnel',
  department TEXT,
  designation TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT
);

ALTER TABLE public.approved_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage approved_users" ON public.approved_users
  USING (auth.jwt()->>'role' = 'service_role');

GRANT ALL ON public.approved_users TO service_role;

-- 4. Create wearable_telemetry table
CREATE TABLE IF NOT EXISTS public.wearable_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  heart_rate INTEGER,
  hrv INTEGER,
  spo2 NUMERIC(4,1),
  steps INTEGER,
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER,
  stress_index INTEGER,
  recovery_score INTEGER,
  resting_heart_rate INTEGER,
  calories INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.wearable_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own telemetry" ON public.wearable_telemetry
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage telemetry" ON public.wearable_telemetry
  USING (auth.jwt()->>'role' = 'service_role');

GRANT ALL ON public.wearable_telemetry TO authenticated;
GRANT ALL ON public.wearable_telemetry TO service_role;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_service_number ON public.profiles(service_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_signup_requests_email ON public.signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON public.signup_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_wearable_user_date ON public.wearable_telemetry(user_id, date);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 6. Enable realtime for key tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signup_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wearable_telemetry;

-- 7. Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'signup_requests', 'approved_users', 'wearable_telemetry');