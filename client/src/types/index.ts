export type UserRole = 
  | 'hr_admin' 
  | 'wellness_mgr' 
  | 'team_lead' 
  | 'employee' 
  | 'data_analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  designation: string;
  anonymizedId: string;
  avatar?: string;
  teamId?: string;
}

export interface WearableDayMetric {
  date: string;
  steps: number;
  restingHeartRate: number;
  sleepHours: number;
  sleepQuality: number; // 0 - 100
  hrv: number; // ms
  calories: number;
  stressScore: number; // 1 - 100
}

export interface WearablesSummary {
  avgSteps: number;
  avgRHR: number;
  avgSleepHours: number;
  avgSleepQuality: number;
  avgHRV: number;
  avgStressScore: number;
  readinessScore: number;
  timeSeries: WearableDayMetric[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  code: 'PHQ9' | 'BURNOUT_MBI' | 'SLEEP_HYGIENE' | 'PULSE_WEEKLY';
  category: 'Mental Health' | 'Workplace' | 'Sleep & Recovery' | 'Weekly Pulse';
  description: string;
  estMinutes: number;
  questions: AssessmentQuestion[];
}

export interface UserAssessmentResult {
  id: string;
  assessmentId: string;
  assessmentCode: string;
  assessmentTitle: string;
  employeeId: string;
  anonymizedId: string;
  date: string;
  score: number;
  maxScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  status: 'Completed' | 'Pending' | 'Overdue';
  summary: string;
  recommendations: string[];
}

export interface StressMetric {
  id: string;
  employeeId: string;
  anonymizedId: string;
  department: 'Operations' | 'Healthcare & Field' | 'Engineering & IT' | 'Administration';
  roleTitle: string;
  stressScore: number; // 1 - 10
  workloadHours: number;
  burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  sleepDeficitHours: number;
  fatigueIndex: number; // 1 - 100
  date: string;
  source: 'PDF Report' | 'Wearable Telemetry' | 'Survey Aggregation' | 'Manual Log';
}

export interface DeploymentRecord {
  id: string;
  employeeId: string;
  anonymizedId: string;
  employeeName?: string;
  department: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  location: string;
  deploymentType: 'High-Intensity Field' | 'On-Site Office' | 'Remote Command' | 'Hybrid Ops';
  stressImpact: 'Elevated' | 'Moderate' | 'Normal';
  status: 'Active' | 'Completed' | 'Upcoming';
  keyMilestones: string[];
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  anonymizedId: string;
  employeeName?: string;
  department: string;
  leaveType: 'Wellness Recharge' | 'Sick Leave' | 'Casual Leave' | 'Earned Leave';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
  appliedDate: string;
}

export interface LeaveBalance {
  wellnessRecharge: { used: number; total: number };
  sickLeave: { used: number; total: number };
  casualLeave: { used: number; total: number };
  earnedLeave: { used: number; total: number };
}

export interface WellnessSurvey {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDepartment: string;
  responsesCount: number;
  totalTarget: number;
  participationRate: number;
  overallScore: number; // 0 - 100
  status: 'Active' | 'Completed';
  createdAt: string;
  dimensions: {
    workLifeBalance: number;
    psychologicalSafety: number;
    physicalEnvironment: number;
    peerSupport: number;
    leadershipEmpathy: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    concerning: number;
  };
  wordCloud: { text: string; value: number; sentiment: 'pos' | 'neu' | 'neg' }[];
  recentFeedback: {
    id: string;
    anonymizedId: string;
    comment: string;
    sentiment: 'Positive' | 'Neutral' | 'At Risk';
    date: string;
  }[];
}

export interface WorkloadRecord {
  id: string;
  employeeId: string;
  anonymizedId: string;
  employeeName?: string;
  department: string;
  roleTitle: string;
  assignedTasks: number;
  completedTasks: number;
  weeklyHoursLogged: number;
  capacityHours: number;
  utilizationRate: number; // %
  overtimeFlag: boolean;
  intensityLevel: 'Optimal' | 'Heavy' | 'Overloaded' | 'Light';
  sprintStatus: 'To Do' | 'In Progress' | 'Review' | 'Blocked';
}

export interface DashboardStats {
  orgWellnessIndex: number;
  prevOrgWellnessIndex: number;
  avgStressIndex: number;
  burnoutRiskCount: number;
  pendingAssessmentsCount: number;
  totalEmployees: number;
  activeSurveysCount: number;
  leaveUtilizationPct: number;
  departmentAverages: {
    department: string;
    wellnessScore: number;
    stressScore: number;
    overtimeRate: number;
  }[];
  recentAlerts: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timeAgo: string;
    department?: string;
  }[];
}
