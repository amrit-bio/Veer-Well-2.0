
-- ============================================================================
-- VeerWell 2.0 — Complete Database Schema
-- HR Employee Wellness & Workforce Analytics Platform
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT,
  rank            TEXT,
  service_number  TEXT UNIQUE,
  force           TEXT DEFAULT 'CRPF',
  unit            TEXT,
  role            TEXT NOT NULL DEFAULT 'personnel'
                    CHECK (role IN ('commander', 'welfare_officer', 'personnel', 'analyst',
                                    'hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst')),
  role_title      TEXT,
  department      TEXT CHECK (department IN ('Operations', 'Healthcare & Field', 'Engineering & IT', 'Administration')),
  designation     TEXT,
  anonymized_id   TEXT UNIQUE,
  team_id         TEXT,
  avatar          TEXT,
  location        TEXT,
  joined_date     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. WEARABLE TELEMETRY (daily biometric readings per user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wearable_telemetry (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  heart_rate        INTEGER CHECK (heart_rate BETWEEN 30 AND 220),
  hrv               INTEGER CHECK (hrv BETWEEN 0 AND 200),
  spo2              NUMERIC(4,1) CHECK (spo2 BETWEEN 50 AND 100),
  steps             INTEGER DEFAULT 0,
  sleep_hours       NUMERIC(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  sleep_quality     INTEGER CHECK (sleep_quality BETWEEN 0 AND 100),
  stress_index      INTEGER CHECK (stress_index BETWEEN 1 AND 100),
  recovery_score    INTEGER CHECK (recovery_score BETWEEN 1 AND 100),
  resting_heart_rate INTEGER,
  calories          INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- ============================================================================
-- 3. SELF-ASSESSMENTS (PHQ-9, MBI, Sleep Hygiene, Weekly Pulse)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assessments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_code   TEXT NOT NULL,
  assessment_title  TEXT NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  score             INTEGER NOT NULL,
  max_score         INTEGER NOT NULL,
  risk_level        TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Severe', 'Critical')),
  status            TEXT DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Overdue')),
  summary           TEXT,
  recommendations   TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. STRESS METRICS (aggregated stress & burnout tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stress_metrics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department        TEXT,
  role_title        TEXT,
  stress_score      NUMERIC(4,1) CHECK (stress_score BETWEEN 0 AND 100),
  workload_hours    INTEGER,
  burnout_risk      TEXT CHECK (burnout_risk IN ('Low', 'Moderate', 'High', 'Critical')),
  sleep_deficit_hrs NUMERIC(3,1),
  fatigue_index     INTEGER,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  source            TEXT CHECK (source IN ('PDF Report', 'Wearable Telemetry', 'Survey Aggregation', 'Manual Log')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DEPLOYMENTS (mission/project assignment records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.deployments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name      TEXT NOT NULL,
  role              TEXT,
  start_date        DATE NOT NULL,
  end_date          DATE,
  location          TEXT,
  deployment_type   TEXT CHECK (deployment_type IN ('High-Intensity Field', 'On-Site Office', 'Remote Command', 'Hybrid Ops')),
  stress_impact     TEXT CHECK (stress_impact IN ('Elevated', 'Moderate', 'Normal')),
  status            TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Upcoming')),
  key_milestones    TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. LEAVE RECORDS (wellness recharge, sick, casual, earned)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leave_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type        TEXT NOT NULL CHECK (leave_type IN ('Wellness Recharge', 'Sick Leave', 'Casual Leave', 'Earned Leave')),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  days              INTEGER NOT NULL,
  status            TEXT DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
  reason            TEXT,
  applied_date      DATE DEFAULT CURRENT_DATE,
  reviewed_by       UUID REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. WELLNESS SURVEYS (org-wide pulse surveys)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wellness_surveys (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT,
  target_department TEXT,
  status            TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Draft')),
  overall_score     INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  participation_rate NUMERIC(5,2),
  created_by        UUID REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. SURVEY RESPONSES (individual anonymous responses to surveys)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id         UUID NOT NULL REFERENCES public.wellness_surveys(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_life_balance       INTEGER CHECK (work_life_balance BETWEEN 0 AND 100),
  psychological_safety    INTEGER CHECK (psychological_safety BETWEEN 0 AND 100),
  physical_environment    INTEGER CHECK (physical_environment BETWEEN 0 AND 100),
  peer_support            INTEGER CHECK (peer_support BETWEEN 0 AND 100),
  leadership_empathy      INTEGER CHECK (leadership_empathy BETWEEN 0 AND 100),
  comment           TEXT,
  sentiment         TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'At Risk')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(survey_id, user_id)
);

-- ============================================================================
-- 9. WORKLOAD RECORDS (task assignment & utilization tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workload_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_tasks      INTEGER DEFAULT 0,
  completed_tasks     INTEGER DEFAULT 0,
  weekly_hours_logged NUMERIC(4,1),
  capacity_hours      NUMERIC(4,1) DEFAULT 40,
  utilization_rate    INTEGER,
  overtime_flag       BOOLEAN DEFAULT FALSE,
  intensity_level     TEXT CHECK (intensity_level IN ('Optimal', 'Heavy', 'Overloaded', 'Light')),
  sprint_status       TEXT CHECK (sprint_status IN ('To Do', 'In Progress', 'Review', 'Blocked')),
  week_start          DATE DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. INTERVENTION ACTIONS (welfare officer prescribed actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.interventions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by        UUID NOT NULL REFERENCES public.profiles(id),
  title             TEXT NOT NULL,
  target_unit       TEXT,
  target_role       TEXT,
  urgency           TEXT CHECK (urgency IN ('Immediate', 'Scheduled', 'Preventative')),
  category          TEXT CHECK (category IN ('Rest Rotation', 'Counseling Session', 'Workload Redistribution', 'Medical Check')),
  description       TEXT,
  counseling_prompt TEXT,
  status            TEXT DEFAULT 'Pending Commander Approval'
                      CHECK (status IN ('Pending Commander Approval', 'Active', 'Resolved')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- ============================================================================
-- 11. WELFARE ALERTS (system-generated alerts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.welfare_alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type              TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title             TEXT NOT NULL,
  force             TEXT,
  unit              TEXT,
  message           TEXT,
  action_required   TEXT,
  resolved          BOOLEAN DEFAULT FALSE,
  resolved_by       UUID REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- ============================================================================
-- 12. FEEDBACK (hackathon/platform feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluator_name    TEXT,
  evaluator_role    TEXT,
  rating            INTEGER CHECK (rating BETWEEN 1 AND 5),
  category          TEXT CHECK (category IN ('Design & Usability', 'AI & Analytics', 'Security & Privacy', 'Strategic Impact')),
  comments          TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_wearable_user_date     ON public.wearable_telemetry(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_user        ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_user_date        ON public.stress_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_user        ON public.deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_user              ON public.leave_records(user_id);
CREATE INDEX IF NOT EXISTS idx_workload_user            ON public.workload_records(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_target    ON public.interventions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user            ON public.feedback(user_id);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Users can only read/write their OWN data unless they have elevated roles
-- ============================================================================

-- Helper: check if current user has a privileged role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Commanders and welfare officers can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin', 'analyst'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────────────────
-- WEARABLE TELEMETRY
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.wearable_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own telemetry"
  ON public.wearable_telemetry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Privileged roles can read all telemetry"
  ON public.wearable_telemetry FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst'));

CREATE POLICY "Users can insert own telemetry"
  ON public.wearable_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own telemetry"
  ON public.wearable_telemetry FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- ASSESSMENTS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Welfare officers can read all assessments"
  ON public.assessments FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst'));

CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- STRESS METRICS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.stress_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stress metrics"
  ON public.stress_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Privileged roles can read all stress metrics"
  ON public.stress_metrics FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst'));

CREATE POLICY "Users can insert own stress metrics"
  ON public.stress_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- DEPLOYMENTS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deployments"
  ON public.deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Commanders can read all deployments"
  ON public.deployments FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst'));

CREATE POLICY "Users can insert own deployments"
  ON public.deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments"
  ON public.deployments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- LEAVE RECORDS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.leave_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leave records"
  ON public.leave_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Commanders can read all leave records"
  ON public.leave_records FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin'));

CREATE POLICY "Users can insert own leave requests"
  ON public.leave_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leave records"
  ON public.leave_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Commanders can update leave status"
  ON public.leave_records FOR UPDATE
  USING (public.get_user_role() IN ('commander', 'hr_admin'));

-- ────────────────────────────────────────────────────────────────────────────
-- WELLNESS SURVEYS (readable by all authenticated, writable by admins)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.wellness_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view surveys"
  ON public.wellness_surveys FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can create surveys"
  ON public.wellness_surveys FOR INSERT
  WITH CHECK (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin'));

CREATE POLICY "Admins can update surveys"
  ON public.wellness_surveys FOR UPDATE
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin'));

-- ────────────────────────────────────────────────────────────────────────────
-- SURVEY RESPONSES
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own survey responses"
  ON public.survey_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Analysts can read all survey responses"
  ON public.survey_responses FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst', 'hr_admin'));

CREATE POLICY "Users can submit own survey responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own survey responses"
  ON public.survey_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- WORKLOAD RECORDS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.workload_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workload"
  ON public.workload_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can read all workload"
  ON public.workload_records FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'analyst', 'team_lead'));

CREATE POLICY "Users can insert own workload"
  ON public.workload_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workload"
  ON public.workload_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- INTERVENTIONS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Target users can view their interventions"
  ON public.interventions FOR SELECT
  USING (auth.uid() = target_user_id);

CREATE POLICY "Welfare staff can view all interventions"
  ON public.interventions FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin'));

CREATE POLICY "Welfare officers can create interventions"
  ON public.interventions FOR INSERT
  WITH CHECK (public.get_user_role() IN ('commander', 'welfare_officer'));

CREATE POLICY "Welfare officers can update interventions"
  ON public.interventions FOR UPDATE
  USING (public.get_user_role() IN ('commander', 'welfare_officer'));

-- ────────────────────────────────────────────────────────────────────────────
-- WELFARE ALERTS (readable by privileged, writable by system/admins)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.welfare_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Privileged roles can view alerts"
  ON public.welfare_alerts FOR SELECT
  USING (public.get_user_role() IN ('commander', 'welfare_officer', 'hr_admin', 'analyst'));

CREATE POLICY "System can create alerts"
  ON public.welfare_alerts FOR INSERT
  WITH CHECK (public.get_user_role() IN ('commander', 'welfare_officer'));

CREATE POLICY "Admins can update alerts"
  ON public.welfare_alerts FOR UPDATE
  USING (public.get_user_role() IN ('commander', 'welfare_officer'));

-- ────────────────────────────────────────────────────────────────────────────
-- FEEDBACK
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
  ON public.feedback FOR SELECT
  USING (public.get_user_role() IN ('commander', 'hr_admin', 'analyst'));

CREATE POLICY "Users can submit own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER for profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- AUTO-CREATE PROFILE on new auth.users signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, anonymized_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    'CAPF-NODE-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
