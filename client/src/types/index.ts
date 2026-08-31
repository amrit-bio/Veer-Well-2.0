export type UserRole = 
  | 'commander'          // Commanding Officer / CO (Unit overview, strategic readiness)
  | 'welfare_officer'    // Welfare Officer / Medical Specialist (Interventions, counseling alerts)
  | 'personnel'          // Frontline Personnel / Jawan (Personal biometrics, self-assessments, leave)
  | 'analyst';           // Data & Behavioral Analyst (Predictive modeling, anonymized research)

export interface User {
  id: string;
  name: string;
  rank: string;          // e.g. "Commandant", "Assistant Commandant", "Inspector", "Head Constable"
  serviceNumber: string; // e.g. "CRPF-840219"
  force: 'CRPF' | 'BSF' | 'ITBP' | 'CISF' | 'SSB' | 'Assam Rifles' | 'NSG' | 'CAPF Command' | string;
  unit: string;          // e.g. "142 Bn (Srinagar Sector)", "88 Mahila Bn", "209 CoBRA Bn"
  role: UserRole;
  roleTitle: string;
  anonymizedId: string;  // e.g. "CAPF-NODE-1042"
  avatar?: string;
  location: string;
}


export interface WearableTelemetry {
  date: string;
  heartRate: number;      // BPM (55 - 98)
  hrv: number;            // ms (28 - 95)
  spo2: number;           // % (92 - 99)
  steps: number;          // Daily count
  sleepHours: number;     // Hours (4.0 - 9.2)
  sleepQuality: number;   // 0 - 100
  stressIndex: number;    // 1 - 100
  recoveryScore: number;  // 1 - 100
}

export interface UnitStressSummary {
  forceName: string;
  totalPersonnel: number;
  avgStressIndex: number;     // 1 - 10
  burnoutRiskCount: number;
  readinessScore: number;     // 0 - 100
  highAltitudeNodes: number;
  fatigueIndex: number;
  activeDeployments: number;
}

export interface PredictiveModelResult {
  cohort: string;
  riskCategory: 'Low Stress' | 'Moderate Stress' | 'High Burnout Risk' | 'Critical Strain';
  predictedStress7Days: number;
  fatigueProbability: number; // %
  topRiskFactors: string[];
  recommendedIntervention: string;
}

export interface InterventionAction {
  id: string;
  title: string;
  targetUnit: string;
  targetRole: string;
  urgency: 'Immediate' | 'Scheduled' | 'Preventative';
  category: 'Rest Rotation' | 'Counseling Session' | 'Workload Redistribution' | 'Medical Check';
  description: string;
  counselingPrompt: string;
  status: 'Pending Commander Approval' | 'Active' | 'Resolved';
  timestamp: string;
}

export interface WelfareAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  force: string;
  unit: string;
  message: string;
  timeAgo: string;
  actionRequired: string;
  resolved: boolean;
}

export interface DatasetItem {
  id: string;
  title: string;
  category: 'HR Records' | 'Deployment History' | 'Leave Logs' | 'Wellness Surveys' | 'Workload Logs' | 'Wearable Streams';
  recordCount: number;
  format: 'CSV' | 'JSON' | 'PDF';
  privacyLevel: '100% Anonymized (Differential Privacy)' | 'K-Anonymity (k=5)';
  description: string;
  downloadUrl?: string;
}

export interface HackathonFeedback {
  id: string;
  evaluatorName: string;
  evaluatorRole: string;
  rating: number; // 1 - 5
  category: 'Design & Usability' | 'AI & Analytics' | 'Security & Privacy' | 'Strategic Impact';
  comments: string;
  date: string;
}
