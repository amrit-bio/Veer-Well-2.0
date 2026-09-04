export interface ServiceIdLookupEntry {
  servicePrefix: string;
  roleCode: string;
  numberMin: number;
  numberMax: number;
  detectedRole: 'commander' | 'welfare_officer' | 'personnel' | 'analyst' | 'hr_admin' | 'wellness_mgr' | 'team_lead' | 'employee' | 'data_analyst';
  detectedRank: string;
  detectedUnit: string;
  detectedLocation: string;
  detectedForce: string;
  roleTitle: string;
  badge?: string;
  description?: string;
}

export interface ServiceIdDetectionResult {
  detectedRole: string;
  detectedRank: string;
  detectedUnit: string;
  detectedLocation: string;
  detectedForce: string;
  roleTitle: string;
  badge?: string;
  description?: string;
}

const SERVICE_ID_LOOKUP: ServiceIdLookupEntry[] = [
  // COMMANDERS
  { servicePrefix: 'CRPF', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: '142 Bn (Srinagar Sector HQ)', detectedLocation: 'Srinagar Sector Command, J&K', detectedForce: 'CRPF', roleTitle: 'Battalion Commanding Officer', badge: 'Strategic Battalion Command', description: 'Battalion Readiness, Rest Approvals, Macro Operational Fatigue Heatmaps.' },
  { servicePrefix: 'BSF', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: '108 Bn (Punjab Sector)', detectedLocation: 'Punjab Border Sector, Amritsar', detectedForce: 'BSF', roleTitle: 'Battalion Commanding Officer', badge: 'Strategic Battalion Command', description: 'Battalion Readiness, Rest Approvals, Border Security Operations.' },
  { servicePrefix: 'ITBP', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: '5 ITBn (Leh Sector)', detectedLocation: 'Leh-Ladakh Sector, J&K', detectedForce: 'ITBP', roleTitle: 'Battalion Commanding Officer', badge: 'Strategic Battalion Command', description: 'Battalion Readiness, Rest Approvals, High-Altitude Fatigue Management.' },
  { servicePrefix: 'CISF', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: 'CISF HQ (Delhi)', detectedLocation: 'New Delhi, Delhi', detectedForce: 'CISF', roleTitle: 'Battalion Commanding Officer', badge: 'Strategic Battalion Command', description: 'Battalion Readiness, Rest Approvals, Airport & Asset Protection.' },
  { servicePrefix: 'SSB', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: '26 SSBn (Sikkim Sector)', detectedLocation: 'Sikkim Border Sector, Gangtok', detectedForce: 'SSB', roleTitle: 'Battalion Commanding Officer', badge: 'Strategic Battalion Command', description: 'Battalion Readiness, Rest Approvals, Jungle Warfare Ops.' },
  { servicePrefix: 'MHA', roleCode: 'CMD', numberMin: 7001, numberMax: 7999, detectedRole: 'commander', detectedRank: 'Commandant / CO', detectedUnit: 'MHA CAPF HQ', detectedLocation: 'New Delhi, Delhi', detectedForce: 'MHA', roleTitle: 'Senior CAPF Commanding Officer', badge: 'Ministry of Home Affairs', description: 'CAPF Policy, Strategic Oversight, Cross-Force Coordination.' },

  // MEDICAL / WELFARE OFFICERS
  { servicePrefix: 'CRPF', roleCode: 'MED', numberMin: 8001, numberMax: 8999, detectedRole: 'welfare_officer', detectedRank: 'Chief Medical & Welfare Officer', detectedUnit: 'Central Composite Hospital, Srinagar', detectedLocation: 'Field Medical Station, Leh-Ladakh Sector', detectedForce: 'CRPF Medical Directorate', roleTitle: 'Unit Welfare & Psychological Specialist', badge: 'Clinical Welfare & Directives', description: 'Prescribe 48h Recovery Respite, Clinical Counseling Scripts, Post-Mission Debriefs.' },
  { servicePrefix: 'BSF', roleCode: 'MED', numberMin: 8001, numberMax: 8999, detectedRole: 'welfare_officer', detectedRank: 'Chief Medical Officer', detectedUnit: 'BSF Composite Hospital, Jalandhar', detectedLocation: 'Punjab Border Sector, Amritsar', detectedForce: 'BSF Medical Directorate', roleTitle: 'Unit Welfare & Psychological Specialist', badge: 'Clinical Welfare & Directives', description: 'Prescribe 48h Recovery Respite, Clinical Counseling Scripts, Border Post Medical Camps.' },
  { servicePrefix: 'ITBP', roleCode: 'MED', numberMin: 8001, numberMax: 8999, detectedRole: 'welfare_officer', detectedRank: 'Chief Medical Officer', detectedUnit: 'ITBP Composite Hospital, Delhi', detectedLocation: 'Delhi HQ, India', detectedForce: 'ITBP Medical Directorate', roleTitle: 'Unit Welfare & Psychological Specialist', badge: 'Clinical Welfare & Directives', description: 'Prescribe 48h Recovery Respite, High-Altitude Medical Protocols.' },
  { servicePrefix: 'CISF', roleCode: 'MED', numberMin: 8001, numberMax: 8999, detectedRole: 'welfare_officer', detectedRank: 'Chief Medical Officer', detectedUnit: 'CISF Composite Hospital, Delhi', detectedLocation: 'New Delhi, Delhi', detectedForce: 'CISF Medical Directorate', roleTitle: 'Unit Welfare & Psychological Specialist', badge: 'Clinical Welfare & Directives', description: 'Prescribe 48h Recovery Respite, Airport Medical Posts.' },
  { servicePrefix: 'SSB', roleCode: 'MED', numberMin: 8001, numberMax: 8999, detectedRole: 'welfare_officer', detectedRank: 'Chief Medical Officer', detectedUnit: 'SSB Composite Hospital, Siliguri', detectedLocation: 'Siliguri, West Bengal', detectedForce: 'SSB Medical Directorate', roleTitle: 'Unit Welfare & Psychological Specialist', badge: 'Clinical Welfare & Directives', description: 'Prescribe 48h Recovery Respite, Jungle Warfare Medical Support.' },

  // PERSONNEL / JAWAN
  { servicePrefix: 'CRPF', roleCode: 'COBRA', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Inspector (Field Command)', detectedUnit: '209 CoBRA Bn (Special Ops)', detectedLocation: 'Forward Post Delta, Siachen Border Area', detectedForce: 'CRPF', roleTitle: 'Tactical Reconnaissance Lead', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'CRPF', roleCode: 'JWN', numberMin: 2001, numberMax: 2999, detectedRole: 'personnel', detectedRank: 'Sub-Inspector (Field)', detectedUnit: '142 Bn (Srinagar Sector HQ)', detectedLocation: 'Srinagar Sector Command, J&K', detectedForce: 'CRPF', roleTitle: 'Frontline Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'CRPF', roleCode: 'HC', numberMin: 3001, numberMax: 3999, detectedRole: 'personnel', detectedRank: 'Head Constable (Field)', detectedUnit: '101 Bn (Anti-Naxal)', detectedLocation: 'Bastar Sector, Chhattisgarh', detectedForce: 'CRPF', roleTitle: 'Frontline Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'BSF', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Inspector (Border Ops)', detectedUnit: '108 Bn (Punjab Sector)', detectedLocation: 'Punjab Border Sector, Amritsar', detectedForce: 'BSF', roleTitle: 'Border Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'ITBP', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Inspector (Mountain Ops)', detectedUnit: '5 ITBn (Leh Sector)', detectedLocation: 'Leh-Ladakh Sector, J&K', detectedForce: 'ITBP', roleTitle: 'Mountain Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'CISF', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Inspector (Security Ops)', detectedUnit: 'CISF Unit (Airport)', detectedLocation: 'Indira Gandhi International Airport, Delhi', detectedForce: 'CISF', roleTitle: 'Airport Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'SSB', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Inspector (Jungle Ops)', detectedUnit: '26 SSBn (Sikkim Sector)', detectedLocation: 'Sikkim Border Sector, Gangtok', detectedForce: 'SSB', roleTitle: 'Border Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'AR', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Rifleman (Mountain Ops)', detectedUnit: '12 Assam Rifles Bn', detectedLocation: 'Dimapur, Nagaland', detectedForce: 'Assam Rifles', roleTitle: 'Mountain Sentinel', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },
  { servicePrefix: 'NSG', roleCode: 'JWN', numberMin: 1001, numberMax: 1999, detectedRole: 'personnel', detectedRank: 'Commando (Special Ops)', detectedUnit: 'NSG Hub (Manesar)', detectedLocation: 'Manesar, Haryana', detectedForce: 'NSG', roleTitle: 'Special Operations', badge: 'Personal Biometrics & Sovereignty', description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.' },

  // ANALYSTS
  { servicePrefix: 'MHA', roleCode: 'ANA', numberMin: 9001, numberMax: 9999, detectedRole: 'analyst', detectedRank: 'Lead Behavioral Data Scientist', detectedUnit: 'HQ Directorate General (People Intelligence)', detectedLocation: 'MHA CAPF HQ, New Delhi', detectedForce: 'MHA CAPF HQ', roleTitle: 'Workforce Stress & Fatigue Analyst', badge: 'Differential Privacy Analytics', description: 'Multi-variate 14-Day Predictive Burnout Regression, Roster What-If Simulation Models.' },
  { servicePrefix: 'CRPF', roleCode: 'RES', numberMin: 5001, numberMax: 5999, detectedRole: 'analyst', detectedRank: 'Research Officer (Statistics)', detectedUnit: 'Directorate of Personnel & Welfare', detectedLocation: 'CRPF HQ, New Delhi', detectedForce: 'CRPF', roleTitle: 'Behavioral Research Analyst', badge: 'Research & Analytics', description: 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.' },
  { servicePrefix: 'BSF', roleCode: 'RES', numberMin: 5001, numberMax: 5999, detectedRole: 'analyst', detectedRank: 'Research Officer (Statistics)', detectedUnit: 'BSF HQ Directorate', detectedLocation: 'BSF HQ, New Delhi', detectedForce: 'BSF', roleTitle: 'Behavioral Research Analyst', badge: 'Research & Analytics', description: 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.' },
  { servicePrefix: 'ITBP', roleCode: 'RES', numberMin: 5001, numberMax: 5999, detectedRole: 'analyst', detectedRank: 'Research Officer (Statistics)', detectedUnit: 'ITBP HQ Directorate', detectedLocation: 'ITBP HQ, New Delhi', detectedForce: 'ITBP', roleTitle: 'Behavioral Research Analyst', badge: 'Research & Analytics', description: 'Statistical analysis of stress patterns, ROC-AUC validation, SHAP feature attribution.' },

  // HR ADMIN
  { servicePrefix: 'CRPF', roleCode: 'HR', numberMin: 6001, numberMax: 6999, detectedRole: 'hr_admin', detectedRank: 'Deputy Commandant (Personnel)', detectedUnit: 'Directorate of Personnel & Welfare', detectedLocation: 'CRPF HQ, New Delhi', detectedForce: 'CRPF', roleTitle: 'HR Administrator', badge: 'HR & Workforce Analytics', description: 'Org-wide wellness surveys, leave policy, ACR compliance, workforce planning.' },
  { servicePrefix: 'BSF', roleCode: 'HR', numberMin: 6001, numberMax: 6999, detectedRole: 'hr_admin', detectedRank: 'Deputy Commandant (Personnel)', detectedUnit: 'BSF HQ Directorate', detectedLocation: 'BSF HQ, New Delhi', detectedForce: 'BSF', roleTitle: 'HR Administrator', badge: 'HR & Workforce Analytics', description: 'Org-wide wellness surveys, leave policy, ACR compliance, workforce planning.' },
  { servicePrefix: 'MHA', roleCode: 'ADM', numberMin: 4001, numberMax: 4999, detectedRole: 'hr_admin', detectedRank: 'Under Secretary (CAPF Welfare)', detectedUnit: 'MHA CAPF Welfare Division', detectedLocation: 'New Delhi, Delhi', detectedForce: 'MHA', roleTitle: 'CAPF Welfare Administrator', badge: 'Ministry Level Oversight', description: 'Cross-force welfare policy, budget allocation, strategic impact assessment.' },
];

export function detectRoleFromServiceId(serviceNumber: string): ServiceIdDetectionResult | null {
  if (!serviceNumber || serviceNumber.trim() === '') {
    return null;
  }

  const normalized = serviceNumber.trim().toUpperCase();

  // Try to parse formats:
  // CRPF-CMD-7801
  // BSF-COBRA-1042
  // MHA-ANA-9104
  // ITBP-MED-8492
  // CRPFCMD7801 (no separators)
  const match = normalized.match(/^([A-Z]{2,5})[-]?([A-Z]{2,10})[-]?(\d+)$/);
  if (!match) {
    return null;
  }

  const prefix = match[1];
  const roleCode = match[2];
  const numberPart = parseInt(match[3], 10);

  if (isNaN(numberPart)) {
    return null;
  }

  const entry = SERVICE_ID_LOOKUP.find(
    (e) =>
      e.servicePrefix === prefix &&
      e.roleCode === roleCode &&
      numberPart >= e.numberMin &&
      numberPart <= e.numberMax
  );

  if (!entry) {
    return null;
  }

  return {
    detectedRole: entry.detectedRole,
    detectedRank: entry.detectedRank,
    detectedUnit: entry.detectedUnit,
    detectedLocation: entry.detectedLocation,
    detectedForce: entry.detectedForce,
    roleTitle: entry.roleTitle,
    badge: entry.badge,
    description: entry.description,
  };
}

export function getAllServiceIdEntries(): ServiceIdLookupEntry[] {
  return SERVICE_ID_LOOKUP;
}
