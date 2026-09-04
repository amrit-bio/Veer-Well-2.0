-- ============================================================================
-- VeerWell 2.0 — Service ID Lookup & Auto-Detection Schema
-- ============================================================================
-- This migration adds:
-- 1. service_id_lookup table for pattern-based rank/post/location detection
-- 2. Helper functions to auto-populate profile fields from service number
-- 3. Seed data for known CAPF service ID ranges
-- 4. RLS policies for the lookup table
-- ============================================================================

-- ============================================================================
-- 1. SERVICE ID LOOKUP TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_id_lookup (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_prefix    TEXT NOT NULL,                       -- e.g. 'CRPF', 'BSF', 'ITBP', 'MHA'
  role_code         TEXT NOT NULL,                       -- e.g. 'CMD', 'MED', 'COBRA', 'ANA'
  number_min        INTEGER NOT NULL,                    -- inclusive start of number range
  number_max        INTEGER NOT NULL,                    -- inclusive end of number range
  detected_role     TEXT NOT NULL CHECK (detected_role IN ('commander', 'welfare_officer', 'personnel', 'analyst', 'hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst')),
  detected_rank     TEXT NOT NULL,                       -- e.g. 'Commandant / CO'
  detected_unit     TEXT NOT NULL,                       -- e.g. '142 Bn (Srinagar Sector HQ)'
  detected_location TEXT NOT NULL,                       -- e.g. 'Srinagar Sector Command, J&K'
  detected_force    TEXT NOT NULL DEFAULT 'CRPF',        -- e.g. 'CRPF', 'BSF', 'ITBP', 'MHA'
  role_title        TEXT NOT NULL,                       -- e.g. 'Battalion Commanding Officer'
  badge             TEXT,                                -- e.g. 'Strategic Battalion Command'
  description       TEXT,                                -- e.g. 'Battalion Readiness, Rest Approvals...'
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(service_prefix, role_code, number_min, number_max)
);

-- ============================================================================
-- 2. INDEXES FOR LOOKUP PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_service_id_lookup_prefix_code
  ON public.service_id_lookup(service_prefix, role_code);

CREATE INDEX IF NOT EXISTS idx_service_id_lookup_active
  ON public.service_id_lookup(is_active)
  WHERE is_active = TRUE;

-- ============================================================================
-- 3. HELPER FUNCTION: Parse service number and return lookup match
-- ============================================================================
CREATE OR REPLACE FUNCTION public.match_service_id(p_service_number TEXT)
RETURNS public.service_id_lookup AS $$
DECLARE
  normalized TEXT;
  prefix TEXT;
  role_code TEXT;
  number_part INTEGER;
  match public.service_id_lookup;
BEGIN
  normalized := UPPER(TRIM(p_service_number));

  -- Extract prefix, role code, and number from formats:
  -- CRPF-CMD-7801
  -- BSF-COBRA-1042
  -- MHA-ANA-9104
  -- ITBP-MED-8492
  -- CRPFCMD7801 (no separators)
  IF normalized ~* '^([A-Z]{2,5})[-]?([A-Z]{2,10})[-]?(\d+)$' THEN
    prefix := REGEXP_REPLACE(normalized, '^([A-Z]{2,5})[-]?([A-Z]{2,10})[-]?(\d+)$', '\1');
    role_code := REGEXP_REPLACE(normalized, '^([A-Z]{2,5})[-]?([A-Z]{2,10})[-]?(\d+)$', '\2');
    number_part := CAST(REGEXP_REPLACE(normalized, '^([A-Z]{2,5})[-]?([A-Z]{2,10})[-]?(\d+)$', '\3') AS INTEGER);
  ELSE
    RETURN NULL;
  END IF;

  SELECT * INTO match
  FROM public.service_id_lookup
  WHERE is_active = TRUE
    AND service_prefix = prefix
    AND role_code = role_code
    AND number_part BETWEEN number_min AND number_max
  LIMIT 1;

  RETURN match;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. HELPER FUNCTION: Auto-detect role metadata from service number
-- ============================================================================
CREATE OR REPLACE FUNCTION public.detect_profile_from_service_id(p_service_number TEXT)
RETURNS TABLE (
  detected_role     TEXT,
  detected_rank     TEXT,
  detected_unit     TEXT,
  detected_location TEXT,
  detected_force    TEXT,
  role_title        TEXT,
  badge             TEXT,
  description       TEXT
) AS $$
DECLARE
  match public.service_id_lookup;
BEGIN
  match := public.match_service_id(p_service_number);

  IF match IS NULL THEN
    RETURN;
  END IF;

  detected_role := match.detected_role;
  detected_rank := match.detected_rank;
  detected_unit := match.detected_unit;
  detected_location := match.detected_location;
  detected_force := match.detected_force;
  role_title := match.role_title;
  badge := match.badge;
  description := match.description;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. ROW LEVEL SECURITY FOR LOOKUP TABLE
-- ============================================================================
ALTER TABLE public.service_id_lookup ENABLE ROW LEVEL SECURITY;

-- Lookup table is readable by all authenticated users (read-only reference data)
CREATE POLICY "Authenticated users can read service ID lookup"
  ON public.service_id_lookup FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins/superusers can modify lookup data
CREATE POLICY "Admins can insert lookup entries"
  ON public.service_id_lookup FOR INSERT
  WITH CHECK (public.get_user_role() IN ('commander', 'hr_admin'));

CREATE POLICY "Admins can update lookup entries"
  ON public.service_id_lookup FOR UPDATE
  USING (public.get_user_role() IN ('commander', 'hr_admin'));

CREATE POLICY "Admins can delete lookup entries"
  ON public.service_id_lookup FOR DELETE
  USING (public.get_user_role() IN ('commander', 'hr_admin'));

-- ============================================================================
-- 6. SEED DATA — Known Service ID Ranges for CAPF Personnel
-- ============================================================================

-- COMMANDERS (CO / Commandant)
INSERT INTO public.service_id_lookup
  (service_prefix, role_code, number_min, number_max, detected_role, detected_rank, detected_unit, detected_location, detected_force, role_title, badge, description)
VALUES
  ('CRPF', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', '142 Bn (Srinagar Sector HQ)', 'Srinagar Sector Command, J&K', 'CRPF', 'Battalion Commanding Officer', 'Strategic Battalion Command', 'Battalion Readiness, Rest Approvals, Macro Operational Fatigue Heatmaps (Names Masked).'),
  ('BSF', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', '108 Bn (Punjab Sector)', 'Punjab Border Sector, Amritsar', 'BSF', 'Battalion Commanding Officer', 'Strategic Battalion Command', 'Battalion Readiness, Rest Approvals, Macro Operational Fatigue Heatmaps.'),
  ('ITBP', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', '5 ITBn (Leh Sector)', 'Leh-Ladakh Sector, J&K', 'ITBP', 'Battalion Commanding Officer', 'Strategic Battalion Command', 'Battalion Readiness, Rest Approvals, High-Altitude Fatigue Management.'),
  ('CISF', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', 'CISF HQ (Delhi)', 'New Delhi, Delhi', 'CISF', 'Battalion Commanding Officer', 'Strategic Battalion Command', 'Battalion Readiness, Rest Approvals, Airport & Asset Protection.'),
  ('SSB', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', '26 SSBn (Sikkim Sector)', 'Sikkim Border Sector, Gangtok', 'SSB', 'Battalion Commanding Officer', 'Strategic Battalion Command', 'Battalion Readiness, Rest Approvals, Jungle Warfare Ops.'),
  ('MHA', 'CMD', 7001, 7999, 'commander', 'Commandant / CO', 'MHA CAPF HQ', 'New Delhi, Delhi', 'MHA', 'Senior CAPF Commanding Officer', 'Ministry of Home Affairs', 'CAPF Policy, Strategic Oversight, Cross-Force Coordination.');

-- MEDICAL / WELFARE OFFICERS
INSERT INTO public.service_id_lookup
  (service_prefix, role_code, number_min, number_max, detected_role, detected_rank, detected_unit, detected_location, detected_force, role_title, badge, description)
VALUES
  ('CRPF', 'MED', 8001, 8999, 'welfare_officer', 'Chief Medical & Welfare Officer', 'Central Composite Hospital, Srinagar', 'Field Medical Station, Leh-Ladakh Sector', 'CRPF Medical Directorate', 'Unit Welfare & Psychological Specialist', 'Clinical Welfare & Directives', 'Prescribe 48h Recovery Respite, Clinical Counseling Scripts, Post-Mission Debriefs.'),
  ('BSF', 'MED', 8001, 8999, 'welfare_officer', 'Chief Medical Officer', 'BSF Composite Hospital, Jalandhar', 'Punjab Border Sector, Amritsar', 'BSF Medical Directorate', 'Unit Welfare & Psychological Specialist', 'Clinical Welfare & Directives', 'Prescribe 48h Recovery Respite, Clinical Counseling Scripts, Border Post Medical Camps.'),
  ('ITBP', 'MED', 8001, 8999, 'welfare_officer', 'Chief Medical Officer', 'ITBP Composite Hospital, Delhi', 'Delhi HQ, India', 'ITBP Medical Directorate', 'Unit Welfare & Psychological Specialist', 'Clinical Welfare & Directives', 'Prescribe 48h Recovery Respite, High-Altitude Medical Protocols.'),
  ('CISF', 'MED', 8001, 8999, 'welfare_officer', 'Chief Medical Officer', 'CISF Composite Hospital, Delhi', 'New Delhi, Delhi', 'CISF Medical Directorate', 'Unit Welfare & Psychological Specialist', 'Clinical Welfare & Directives', 'Prescribe 48h Recovery Respite, Airport Medical Posts.'),
  ('SSB', 'MED', 8001, 8999, 'welfare_officer', 'Chief Medical Officer', 'SSB Composite Hospital, Siliguri', 'Siliguri, West Bengal', 'SSB Medical Directorate', 'Unit Welfare & Psychological Specialist', 'Clinical Welfare & Directives', 'Prescribe 48h Recovery Respite, Jungle Warfare Medical Support.');

-- PERSONNEL / JAWAN (Frontline)
INSERT INTO public.service_id_lookup
  (service_prefix, role_code, number_min, number_max, detected_role, detected_rank, detected_unit, detected_location, detected_force, role_title, badge, description)
VALUES
  ('CRPF', 'COBRA', 1001, 1999, 'personnel', 'Inspector (Field Command)', '209 CoBRA Bn (Special Ops)', 'Forward Post Delta, Siachen Border Area', 'CRPF', 'Tactical Reconnaissance Lead', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('CRPF', 'JWN', 2001, 2999, 'personnel', 'Sub-Inspector (Field)', '142 Bn (Srinagar Sector HQ)', 'Srinagar Sector Command, J&K', 'CRPF', 'Frontline Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('CRPF', 'HC', 3001, 3999, 'personnel', 'Head Constable (Field)', '101 Bn (Anti-Naxal)', ' Bastar Sector, Chhattisgarh', 'CRPF', 'Frontline Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('BSF', 'JWN', 1001, 1999, 'personnel', 'Inspector (Border Ops)', '108 Bn (Punjab Sector)', 'Punjab Border Sector, Amritsar', 'BSF', 'Border Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('ITBP', 'JWN', 1001, 1999, 'personnel', 'Inspector (Mountain Ops)', '5 ITBn (Leh Sector)', 'Leh-Ladakh Sector, J&K', 'ITBP', 'Mountain Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('CISF', 'JWN', 1001, 1999, 'personnel', 'Inspector (Security Ops)', 'CISF Unit (Airport)', 'Indira Gandhi International Airport, Delhi', 'CISF', 'Airport Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('SSB', 'JWN', 1001, 1999, 'personnel', 'Inspector (Jungle Ops)', '26 SSBn (Sikkim Sector)', 'Sikkim Border Sector, Gangtok', 'SSB', 'Border Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('AR', 'JWN', 1001, 1999, 'personnel', 'Rifleman (Mountain Ops)', '12 Assam Rifles Bn', 'Dimapur, Nagaland', 'Assam Rifles', 'Mountain Sentinel', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.'),
  ('NSG', 'JWN', 1001, 1999, 'personnel', 'Commando (Special Ops)', 'NSG Hub (Manesar)', 'Manesar, Haryana', 'NSG', 'Special Operations', 'Personal Biometrics & Sovereignty', 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.');

-- BEHAVIORAL ANALYSTS
INSERT INTO public.service_id_lookup
  (service_prefix, role_code, number_min, number_max, detected_role, detected_rank, detected_unit, detected_location, detected_force, role_title, badge, description)
VALUES
  ('MHA', 'ANA', 9001, 9999, 'analyst', 'Lead Behavioral Data Scientist', 'HQ Directorate General (People Intelligence)', 'MHA CAPF HQ, New Delhi', 'MHA CAPF HQ', 'Workforce Stress & Fatigue Analyst', 'Differential Privacy Analytics', 'Multi-variate 14-Day Predictive Burnout Regression, Roster What-If Simulation Models.'),
  ('CRPF', 'RES', 5001, 5999, 'analyst', 'Research Officer (Statistics)', 'Directorate of Personnel & Welfare', 'CRPF HQ, New Delhi', 'CRPF', 'Behavioral Research Analyst', 'Research & Analytics', 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.'),
  ('BSF', 'RES', 5001, 5999, 'analyst', 'Research Officer (Statistics)', 'BSF HQ Directorate', 'BSF HQ, New Delhi', 'BSF', 'Behavioral Research Analyst', 'Research & Analytics', 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.'),
  ('ITBP', 'RES', 5001, 5999, 'analyst', 'Research Officer (Statistics)', 'ITBP HQ Directorate', 'ITBP HQ, New Delhi', 'ITBP', 'Behavioral Research Analyst', 'Research & Analytics', 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.');

-- HR ADMIN & MANAGEMENT ROLES
INSERT INTO public.service_id_lookup
  (service_prefix, role_code, number_min, number_max, detected_role, detected_rank, detected_unit, detected_location, detected_force, role_title, badge, description)
VALUES
  ('CRPF', 'HR', 6001, 6999, 'hr_admin', 'Deputy Commandant (Personnel)', 'Directorate of Personnel & Welfare', 'CRPF HQ, New Delhi', 'CRPF', 'HR Administrator', 'HR & Workforce Analytics', 'Org-wide wellness surveys, leave policy, ACR compliance, workforce planning.'),
  ('BSF', 'HR', 6001, 6999, 'hr_admin', 'Deputy Commandant (Personnel)', 'BSF HQ Directorate', 'BSF HQ, New Delhi', 'BSF', 'HR Administrator', 'HR & Workforce Analytics', 'Org-wide wellness surveys, leave policy, ACR compliance, workforce planning.'),
  ('MHA', 'ADM', 4001, 4999, 'hr_admin', 'Under Secretary (CAPF Welfare)', 'MHA CAPF Welfare Division', 'New Delhi, Delhi', 'MHA', 'CAPF Welfare Administrator', 'Ministry Level Oversight', 'Cross-force welfare policy, budget allocation, strategic impact assessment.');

-- ============================================================================
-- 7. TRIGGER: Auto-populate profile from service number on insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auto_populate_profile_from_service_id()
RETURNS TRIGGER AS $$
DECLARE
  lookup public.service_id_lookup;
BEGIN
  IF NEW.service_number IS NOT NULL AND NEW.service_number <> '' THEN
    lookup := public.match_service_id(NEW.service_number);

    IF lookup IS NOT NULL THEN
      NEW.role := lookup.detected_role;
      NEW.rank := lookup.detected_rank;
      NEW.unit := lookup.detected_unit;
      NEW.location := lookup.detected_location;
      NEW.force := lookup.detected_force;
      NEW.role_title := lookup.role_title;

      IF NEW.anonymized_id IS NULL OR NEW.anonymized_id = '' THEN
        NEW.anonymized_id := 'CAPF-NODE-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 5));
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_service_id_lookup ON public.profiles;
CREATE TRIGGER on_profile_service_id_lookup
  BEFORE INSERT OR UPDATE OF service_number ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_populate_profile_from_service_id();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.service_id_lookup TO authenticated;
GRANT ALL ON public.service_id_lookup TO service_role;

-- ============================================================================
-- 9. SAMPLE LOOKUP QUERIES (for testing in Supabase SQL Editor)
-- ============================================================================

-- Test exact match:
-- SELECT * FROM public.match_service_id('CRPF-CMD-7801');

-- Test auto-detect:
-- SELECT * FROM public.detect_profile_from_service_id('CRPF-COBRA-1042');

-- Test without separators:
-- SELECT * FROM public.match_service_id('MHAANA9104');

-- View all lookup entries:
-- SELECT * FROM public.service_id_lookup WHERE is_active = TRUE ORDER BY service_prefix, role_code, number_min;
