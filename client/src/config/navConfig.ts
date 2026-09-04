import React from 'react';
import { UserRole } from '../types';
import {
  Home,
  LayoutDashboard,
  ClipboardCheck,
  LineChart,
  HeartPulse,
  ShieldCheck,
  Database,
  Award,
  Info,
  Cpu,
  MessageSquare,
  Shield,
  Mic,
  Radio,
  Stethoscope,
  Activity,
  MapPin,
  Users,
} from 'lucide-react';

export type NavCategory = 'Core Modules' | 'Analytics & Welfare' | 'Operational Command' | 'Platform & Demo';

export interface TabItem {
  id: string;
  label: string;
  category: NavCategory;
  icon: React.ElementType;
  badge?: string;
  description: string;
  roles: UserRole[];
  operationalScope?: string;
}

/**
 * Master Navigation Configuration with Granular Role-Based Access Control (RBAC)
 * 
 * 🟢 Frontline Personnel (personnel): Personal biometrics, confidential PHQ-9, personal leave, zero-trust privacy, smart sensors
 * 🟡 Commanding Officer (commander): Battalion readiness, 14-day predictive curves, rest interventions, doctrine compliance, strategic impact
 * 🔵 Medical & Welfare Officer (welfare_officer): Doctor-patient privileged biometrics, 48h hypoxia respites, 7-14d clinical warnings, medical PPG patches
 * 🟣 Behavioral Data Scientist (analyst): 14-day multivariate regression, differential privacy sets, synthetic datasets, ROI analytics, Postgres RLS
 */
export const NAV_CONFIG: TabItem[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. CORE MODULES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'home',
    label: 'Home / Overview',
    category: 'Core Modules',
    icon: Home,
    description: 'Dynamic command summary matching active military persona clearance',
    roles: ['personnel', 'commander', 'welfare_officer', 'analyst'],
    operationalScope: 'All Roles (Customized widgets per clearance tier)',
  },
  {
    id: 'dashboard',
    label: 'My Readiness',
    category: 'Core Modules',
    icon: LayoutDashboard,
    badge: 'Live',
    description: 'Live PPG, SpO2, sleep architecture, parasympathetic tone & personal readiness',
    roles: ['personnel'],
    operationalScope: 'Frontline Jawans (Personal Biometrics & Sovereignty)',
  },
  {
    id: 'commander-dashboard',
    label: 'Unit Readiness',
    category: 'Operational Command',
    icon: LayoutDashboard,
    badge: 'Live',
    description: 'Aggregated unit heatmap, deployment logistics & actionable insights',
    roles: ['commander'],
    operationalScope: 'Commanding Officers (Battalion Command & Strategic Readiness)',
  },
  {
    id: 'clinical-dashboard',
    label: 'Clinical Dashboard',
    category: 'Operational Command',
    icon: Stethoscope,
    badge: 'Clinical',
    description: 'De-anonymized high-risk profiles, automated intervention recommendations & clinical triage',
    roles: ['welfare_officer'],
    operationalScope: 'Medical & Welfare Officers (Doctor-Patient Privilege)',
  },
  {
    id: 'assessment',
    label: 'Self-Assessment',
    category: 'Core Modules',
    icon: ClipboardCheck,
    badge: 'Confidential',
    description: 'Voluntary PHQ-9 mental stamina screeners & confidential 3-day recharge request',
    roles: ['personnel'],
    operationalScope: 'Strictly Frontline Personnel (Masked from CO & Commanders)',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ANALYTICS & WELFARE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'analytics',
    label: 'Predictive Analytics',
    category: 'Analytics & Welfare',
    icon: LineChart,
    badge: '14-Day AI',
    description: '14-day multivariate regression curves, What-If simulation, burnout risk',
    roles: ['commander', 'welfare_officer', 'analyst'],
    operationalScope: 'Commanding Officers, Medical Specialists & Behavioral Analysts',
  },
  {
    id: 'interventions',
    label: 'Intervention Pipeline',
    category: 'Analytics & Welfare',
    icon: HeartPulse,
    badge: 'Rest Roster',
    description: 'Battalion rest rotation authorizations, 48h hypoxia respites & counseling scripts',
    roles: ['commander', 'welfare_officer'],
    operationalScope: 'Commanding Officers (Authorizations) & Medical Officers (Clinical Prescriptions)',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    category: 'Analytics & Welfare',
    icon: ShieldCheck,
    badge: 'Zero-Trust',
    description: 'Armed Forces Welfare Doctrine compliance, k-anonymity & differential privacy',
    roles: ['personnel', 'commander', 'analyst'],
    operationalScope: 'Jawans (Data Isolation Pledge), Commanders (Doctrine Audit), Analysts (Epsilon Config)',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. OPERATIONAL COMMAND
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'deployment-logistics',
    label: 'Deployment Logistics',
    category: 'Operational Command',
    icon: MapPin,
    badge: 'Tactical',
    description: 'Post locations mapped against unit readiness, fatigue scores & altitude risk',
    roles: ['commander'],
    operationalScope: 'Commanding Officers (Operational Deployment Planning)',
  },
  {
    id: 'algorithm-telemetry',
    label: 'Algorithm Telemetry',
    category: 'Operational Command',
    icon: Activity,
    badge: 'ML Ops',
    description: 'Model accuracy monitoring, false positives/negatives, ROC-AUC drift & feature importance',
    roles: ['analyst'],
    operationalScope: 'Behavioral Data Analysts (Model Validation & Continuous Training)',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PLATFORM & DEMO
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'datasets',
    label: 'Data Analytics Hub',
    category: 'Platform & Demo',
    icon: Database,
    badge: 'CSV / PDF',
    description: 'Differential privacy exports, model validation pipelines & synthetic generation',
    roles: ['analyst'],
    operationalScope: 'Behavioral Data Analysts (Anonymized R&D Only)',
  },
  {
    id: 'impact',
    label: 'Impact & Benefits',
    category: 'Platform & Demo',
    icon: Award,
    description: 'Operational readiness indicators, duty fatigue mitigation & platform ROI',
    roles: ['commander', 'analyst'],
    operationalScope: 'Commanders (Strategic Readiness) & Analysts (Platform Metrics)',
  },
  {
    id: 'integrations',
    label: 'Device Integrations',
    category: 'Platform & Demo',
    icon: Cpu,
    description: 'Smartwatch/tactical bio-sensor sync, medical PPG patches & telemetry integrity',
    roles: ['personnel', 'welfare_officer'],
    operationalScope: 'Jawans (Personal Smartwatch Sync) & Medical Officers (Clinical Patch Status)',
  },
  {
    id: 'voice-assistant',
    label: 'Tactical Voice Assistant',
    category: 'Core Modules',
    icon: Mic,
    badge: 'PTT',
    description: 'Push-to-talk voice interface for wellness reporting, leave requests & hands-free navigation',
    roles: ['personnel'],
    operationalScope: 'Frontline Personnel (Hands-Free Tactical Operations)',
  },
  {
    id: 'peer-support',
    label: 'Peer Support & Resources',
    category: 'Analytics & Welfare',
    icon: Users,
    description: 'Privacy-preserving wellness modules, anonymous counseling channels & unit support',
    roles: ['personnel'],
    operationalScope: 'Frontline Personnel (Confidential Peer Support Network)',
  },
  {
    id: 'supabase-data',
    label: 'Live Database Explorer',
    category: 'Platform & Demo',
    icon: Database,
    badge: 'Postgres RLS',
    description: 'Live multi-table PostgreSQL inspector & Row-Level Security schema auditor',
    roles: ['analyst'],
    operationalScope: 'Behavioral Data Analysts & System Administrators',
  },
  {
    id: 'about',
    label: 'Hackathon / About',
    category: 'Platform & Demo',
    icon: Info,
    description: 'Platform architecture, armed forces welfare doctrine & hackathon roadmap',
    roles: [],
    operationalScope: 'Removed from analyst role per access-control update',
  },
  {
    id: 'feedback',
    label: 'Hackathon Feedback',
    category: 'Platform & Demo',
    icon: MessageSquare,
    badge: 'Evaluate',
    description: 'Jury & evaluator review form across AI, UI, security & strategic impact',
    roles: [],
    operationalScope: 'Removed from analyst role per access-control update',
  },
];

export const NAV_CATEGORIES: NavCategory[] = [
  'Core Modules',
  'Analytics & Welfare',
  'Operational Command',
  'Platform & Demo',
];

/**
 * Returns all accessible navigation items for a given military persona role.
 */
export function getVisibleTabsForRole(role: UserRole): TabItem[] {
  return NAV_CONFIG.filter((tab) => tab.roles.includes(role));
}

/**
 * Returns accessible categories that contain at least one visible tab for the given role.
 */
export function getVisibleCategoriesForRole(role: UserRole): NavCategory[] {
  const visibleTabs = getVisibleTabsForRole(role);
  return NAV_CATEGORIES.filter((cat) =>
    visibleTabs.some((tab) => tab.category === cat)
  );
}

/**
 * Checks if a specific tab ID is permitted under RBAC for the given role.
 */
export function isTabAccessible(tabId: string, role: UserRole): boolean {
  const tab = NAV_CONFIG.find((t) => t.id === tabId);
  if (!tab) return false;
  return tab.roles.includes(role);
}

/**
 * Returns the default fallback tab for a role if currently on an unauthorized tab.
 */
export function getDefaultTabForRole(role: UserRole): string {
  switch (role) {
    case 'commander':
      return 'commander-dashboard';
    case 'welfare_officer':
      return 'clinical-dashboard';
    case 'analyst':
      return 'algorithm-telemetry';
    case 'personnel':
    default:
      return 'dashboard';
  }
}
