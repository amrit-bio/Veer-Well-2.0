import { UserRole } from '../types';

export type Tier = 1 | 2 | 3 | 4;

export type Force =
  | 'CRPF'
  | 'BSF'
  | 'ITBP'
  | 'CISF'
  | 'SSB'
  | 'Assam Rifles'
  | 'NSG';

export type RankTier =
  | 'dg'
  | 'adg'
  | 'ig'
  | 'dig'
  | 'commandant'
  | '2ic'
  | 'dy_commandant'
  | 'asst_commandant'
  | 'subedar_major'
  | 'subedar'
  | 'si'
  | 'asi'
  | 'hc'
  | 'constable';

export type MedicalCadreRank =
  | 'medical_officer'
  | 'sr_medical_officer'
  | 'chief_medical_officer';

export type TechnicalCadreRank =
  | 'junior_analyst'
  | 'analyst'
  | 'sr_analyst'
  | 'chief_analyst';

export type AllRankTier = RankTier | MedicalCadreRank | TechnicalCadreRank;

export interface RankConfig {
  rankTier: AllRankTier;
  tier: Tier;
  displayName: string;
  shortName: string;
  force: Force[];
  userRole: UserRole;
  scope: 'sector' | 'battalion' | 'company' | 'platoon' | 'personal';
  escalationTarget: AllRankTier | null;
  canEscalate: boolean;
  canViewRawClinical: boolean;
  canViewAnonymizedAggregate: boolean;
  canCreateIntervention: boolean;
  canApproveIntervention: boolean;
  isGazetted: boolean;
  payMatrix: string;
}

export const RANK_TIER_MAP: Record<RankTier, RankConfig> = {
  dg: {
    rankTier: 'dg',
    tier: 1,
    displayName: 'Director General',
    shortName: 'DG',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'senior_command',
    scope: 'sector',
    escalationTarget: null,
    canEscalate: false,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 17',
  },
  adg: {
    rankTier: 'adg',
    tier: 1,
    displayName: 'Additional Director General',
    shortName: 'ADG',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'senior_command',
    scope: 'sector',
    escalationTarget: 'dg',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 16',
  },
  ig: {
    rankTier: 'ig',
    tier: 1,
    displayName: 'Inspector General',
    shortName: 'IG',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'senior_command',
    scope: 'sector',
    escalationTarget: 'adg',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 15',
  },
  dig: {
    rankTier: 'dig',
    tier: 1,
    displayName: 'Deputy Inspector General',
    shortName: 'DIG',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'senior_command',
    scope: 'sector',
    escalationTarget: 'ig',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 14',
  },
  commandant: {
    rankTier: 'commandant',
    tier: 2,
    displayName: 'Commandant / Commanding Officer',
    shortName: 'CO',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles', 'NSG'],
    userRole: 'commander',
    scope: 'battalion',
    escalationTarget: 'dig',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 13',
  },
  '2ic': {
    rankTier: '2ic',
    tier: 2,
    displayName: 'Second-in-Command',
    shortName: '2IC',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'commander',
    scope: 'battalion',
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 12',
  },
  dy_commandant: {
    rankTier: 'dy_commandant',
    tier: 2,
    displayName: 'Deputy Commandant',
    shortName: 'Dy Cmdt',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'commander',
    scope: 'battalion',
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 11',
  },
  asst_commandant: {
    rankTier: 'asst_commandant',
    tier: 2,
    displayName: 'Assistant Commandant',
    shortName: 'AC',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'commander',
    scope: 'company',
    escalationTarget: 'dy_commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 10',
  },
  subedar_major: {
    rankTier: 'subedar_major',
    tier: 3,
    displayName: 'Subedar Major',
    shortName: 'Sub Maj',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'subordinate_officer',
    scope: 'platoon',
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 7',
  },
  subedar: {
    rankTier: 'subedar',
    tier: 3,
    displayName: 'Subedar / Inspector',
    shortName: 'Sub',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'subordinate_officer',
    scope: 'platoon',
    escalationTarget: 'subedar_major',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 6',
  },
  si: {
    rankTier: 'si',
    tier: 3,
    displayName: 'Sub-Inspector',
    shortName: 'SI',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'subordinate_officer',
    scope: 'platoon',
    escalationTarget: 'subedar',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 5',
  },
  asi: {
    rankTier: 'asi',
    tier: 3,
    displayName: 'Assistant Sub-Inspector',
    shortName: 'ASI',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'subordinate_officer',
    scope: 'platoon',
    escalationTarget: 'si',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 4',
  },
  hc: {
    rankTier: 'hc',
    tier: 4,
    displayName: 'Head Constable',
    shortName: 'HC',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles', 'NSG'],
    userRole: 'personnel',
    scope: 'personal',
    escalationTarget: 'asi',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: false,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 3',
  },
  constable: {
    rankTier: 'constable',
    tier: 4,
    displayName: 'Constable / Constable GD',
    shortName: 'Cst',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles', 'NSG'],
    userRole: 'personnel',
    scope: 'personal',
    escalationTarget: 'hc',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: false,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 1',
  },
};

export const MEDICAL_CADRE_MAP: Record<MedicalCadreRank, RankConfig> = {
  medical_officer: {
    rankTier: 'medical_officer',
    tier: 2,
    displayName: 'Medical Officer',
    shortName: 'MO',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'welfare_officer',
    scope: 'battalion',
    escalationTarget: 'chief_medical_officer',
    canEscalate: true,
    canViewRawClinical: true,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 11',
  },
  sr_medical_officer: {
    rankTier: 'sr_medical_officer',
    tier: 2,
    displayName: 'Senior Medical Officer',
    shortName: 'SR MO',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'welfare_officer',
    scope: 'battalion',
    escalationTarget: 'chief_medical_officer',
    canEscalate: true,
    canViewRawClinical: true,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 12',
  },
  chief_medical_officer: {
    rankTier: 'chief_medical_officer',
    tier: 2,
    displayName: 'Chief Medical Officer',
    shortName: 'CMO',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'welfare_officer',
    scope: 'battalion',
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: true,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 13',
  },
};

export const TECHNICAL_CADRE_MAP: Record<TechnicalCadreRank, RankConfig> = {
  junior_analyst: {
    rankTier: 'junior_analyst',
    tier: 2,
    displayName: 'Junior Data Analyst',
    shortName: 'Jr Analyst',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'analyst',
    scope: 'sector',
    escalationTarget: 'analyst',
    canEscalate: false,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 7',
  },
  analyst: {
    rankTier: 'analyst',
    tier: 2,
    displayName: 'Data / Behavioral Analyst',
    shortName: 'Analyst',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'analyst',
    scope: 'sector',
    escalationTarget: 'sr_analyst',
    canEscalate: false,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 10',
  },
  sr_analyst: {
    rankTier: 'sr_analyst',
    tier: 2,
    displayName: 'Senior Data Analyst',
    shortName: 'Sr Analyst',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'analyst',
    scope: 'sector',
    escalationTarget: 'chief_analyst',
    canEscalate: false,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 11',
  },
  chief_analyst: {
    rankTier: 'chief_analyst',
    tier: 2,
    displayName: 'Chief Data Officer',
    shortName: 'CDO',
    force: ['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles'],
    userRole: 'analyst',
    scope: 'sector',
    escalationTarget: null,
    canEscalate: false,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 13',
  },
};

export interface NSGDeputationEntry {
  rankTier: RankTier;
  displayName: string;
  shortName: string;
  force: ['NSG'];
  escalationTarget: AllRankTier;
  canEscalate: boolean;
  canViewRawClinical: boolean;
  canViewAnonymizedAggregate: boolean;
  canCreateIntervention: boolean;
  canApproveIntervention: boolean;
  isGazetted: boolean;
  payMatrix: string;
}

export const NSG_DEPUTATION_MAP: Record<RankTier, NSGDeputationEntry> = {
  commandant: {
    rankTier: 'commandant',
    displayName: 'Commandant — NSG Deputation',
    shortName: 'CO-NSG',
    force: ['NSG'],
    escalationTarget: 'dig',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: true,
    isGazetted: true,
    payMatrix: 'Level 13 + NSG Allowances',
  },
  '2ic': {
    rankTier: '2ic',
    displayName: '2IC — NSG Deputation',
    shortName: '2IC-NSG',
    force: ['NSG'],
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 12 + NSG Allowances',
  },
  dy_commandant: {
    rankTier: 'dy_commandant',
    displayName: 'Deputy Commandant — NSG Deputation',
    shortName: 'Dy-NSG',
    force: ['NSG'],
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 11 + NSG Allowances',
  },
  asst_commandant: {
    rankTier: 'asst_commandant',
    displayName: 'Assistant Commandant — NSG Deputation',
    shortName: 'AC-NSG',
    force: ['NSG'],
    escalationTarget: 'dy_commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: true,
    canApproveIntervention: false,
    isGazetted: true,
    payMatrix: 'Level 10 + NSG Allowances',
  },
  subedar_major: {
    rankTier: 'subedar_major',
    displayName: 'Subedar Major — NSG Deputation',
    shortName: 'Sub Maj-NSG',
    force: ['NSG'],
    escalationTarget: 'commandant',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 7 + NSG Allowances',
  },
  subedar: {
    rankTier: 'subedar',
    displayName: 'Subedar — NSG Deputation',
    shortName: 'Sub-NSG',
    force: ['NSG'],
    escalationTarget: 'subedar_major',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 6 + NSG Allowances',
  },
  si: {
    rankTier: 'si',
    displayName: 'Sub-Inspector — NSG Deputation',
    shortName: 'SI-NSG',
    force: ['NSG'],
    escalationTarget: 'subedar',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 5 + NSG Allowances',
  },
  asi: {
    rankTier: 'asi',
    displayName: 'ASI — NSG Deputation',
    shortName: 'ASI-NSG',
    force: ['NSG'],
    escalationTarget: 'si',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: true,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 4 + NSG Allowances',
  },
  hc: {
    rankTier: 'hc',
    displayName: 'Head Constable — NSG Deputation',
    shortName: 'HC-NSG',
    force: ['NSG'],
    escalationTarget: 'asi',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: false,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 3 + NSG Allowances',
  },
  constable: {
    rankTier: 'constable',
    displayName: 'Constable — NSG Deputation',
    shortName: 'Cst-NSG',
    force: ['NSG'],
    escalationTarget: 'hc',
    canEscalate: true,
    canViewRawClinical: false,
    canViewAnonymizedAggregate: false,
    canCreateIntervention: false,
    canApproveIntervention: false,
    isGazetted: false,
    payMatrix: 'Level 1 + NSG Allowances',
  },
  dg: {} as any,
  adg: {} as any,
  ig: {} as any,
  dig: {} as any,
};

export function getRankConfig(rankTier: RankTier, force: Force): RankConfig {
  if (force === 'NSG' && NSG_DEPUTATION_MAP[rankTier]) {
    return {
      ...RANK_TIER_MAP[rankTier],
      ...NSG_DEPUTATION_MAP[rankTier],
    };
  }
  return RANK_TIER_MAP[rankTier];
}

export function getTierForRole(role: UserRole): Tier {
  switch (role) {
    case 'senior_command': return 1;
    case 'commander': return 2;
    case 'subordinate_officer': return 3;
    case 'personnel': return 4;
    case 'welfare_officer': return 2;
    case 'analyst': return 2;
    case 'nsg_taskforce': return 2;
    default: return 4;
  }
}

export function getScopeForRole(role: UserRole): 'sector' | 'battalion' | 'company' | 'platoon' | 'personal' {
  switch (role) {
    case 'senior_command': return 'sector';
    case 'commander': return 'battalion';
    case 'welfare_officer': return 'battalion';
    case 'analyst': return 'sector';
    case 'subordinate_officer': return 'platoon';
    case 'personnel': return 'personal';
    case 'nsg_taskforce': return 'battalion';
    default: return 'personal';
  }
}

export function canViewAnonymizedData(role: UserRole): boolean {
  return role !== 'personnel';
}

export function canViewRawClinicalData(role: UserRole): boolean {
  return role === 'welfare_officer';
}

export function canApproveIntervention(role: UserRole): boolean {
  return role === 'commander' || role === 'senior_command' || role === 'welfare_officer' || role === 'nsg_taskforce';
}

export function getAllRanksByTier(tier: Tier): AllRankTier[] {
  return (Object.values(RANK_TIER_MAP) as RankConfig[])
    .filter((c) => c.tier === tier)
    .map((c) => c.rankTier);
}

export const TIER_LABELS: Record<Tier, string> = {
  1: 'Senior Command (Gazetted, Group A)',
  2: 'Field Command (Gazetted, Group A)',
  3: 'Subordinate Officers (Non-Gazetted)',
  4: 'Constabulary (Non-Gazetted)',
};
