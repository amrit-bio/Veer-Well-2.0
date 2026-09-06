import { UserRole } from '../types';
import { RankTier, AllRankTier } from '../config/rankHierarchy';

export interface ServiceIdEntry {
  pattern: RegExp;
  force: string;
  rank: string;
  rankTier: AllRankTier;
  role: UserRole;
  unit: string;
  location: string;
  sector: string;
}

export const SERVICE_ID_LOOKUP: ServiceIdEntry[] = [
  // ── CRPF ──────────────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^CRPF-DIG-\d{4}$/i, force: 'CRPF', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, North Sector', location: 'Jammu & Kashmir', sector: 'North Sector' },
  { pattern: /^CRPF-IG-\d{4}$/i, force: 'CRPF', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, Central Sector', location: 'New Delhi', sector: 'Central Sector' },
  { pattern: /^CRPF-ADG-\d{4}$/i, force: 'CRPF', rank: 'Additional Director General', rankTier: 'adg', role: 'senior_command', unit: 'ADG Office, CRPF HQ', location: 'New Delhi', sector: 'CRPF HQ' },
  // Commandant Level
  { pattern: /^CRPF-CMD-\d{4}$/i, force: 'CRPF', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Sector Command)', location: 'Field Deployment', sector: 'Multiple Sectors' },
  { pattern: /^CRPF-CO-\d{4}$/i, force: 'CRPF', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Sector Command)', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // 2IC / Dy Commandant
  { pattern: /^CRPF-2IC-\d{4}$/i, force: 'CRPF', rank: 'Second-in-Command (2IC)', rankTier: '2ic', role: 'commander', unit: 'Bn HQ (Operations)', location: 'Field Deployment', sector: 'Multiple Sectors' },
  { pattern: /^CRPF-DY-\d{4}$/i, force: 'CRPF', rank: 'Deputy Commandant', rankTier: 'dy_commandant', role: 'commander', unit: 'Bn HQ (Administration)', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Assistant Commandant
  { pattern: /^CRPF-AC-\d{4}$/i, force: 'CRPF', rank: 'Assistant Commandant', rankTier: 'asst_commandant', role: 'commander', unit: 'Company Command', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Subedar Major
  { pattern: /^CRPF-SM-\d{4}$/i, force: 'CRPF', rank: 'Subedar Major', rankTier: 'subedar_major', role: 'subordinate_officer', unit: 'Bn HQ, Company', location: 'Field Deployment', sector: 'Multiple Sectors' },
  { pattern: /^CRPF-SUBMAJ-\d{4}$/i, force: 'CRPF', rank: 'Subedar Major', rankTier: 'subedar_major', role: 'subordinate_officer', unit: 'Bn HQ, Company', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Subedar / Inspector
  { pattern: /^CRPF-SUB-\d{4}$/i, force: 'CRPF', rank: 'Subedar', rankTier: 'subedar', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Field Deployment', sector: 'Multiple Sectors' },
  { pattern: /^CRPF-INSP-\d{4}$/i, force: 'CRPF', rank: 'Inspector', rankTier: 'subedar', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Sub-Inspector
  { pattern: /^CRPF-SI-\d{4}$/i, force: 'CRPF', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Assistant Sub-Inspector
  { pattern: /^CRPF-ASI-\d{4}$/i, force: 'CRPF', rank: 'Assistant Sub-Inspector (ASI)', rankTier: 'asi', role: 'subordinate_officer', unit: 'Section Command', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Head Constable
  { pattern: /^CRPF-HC-\d{4}$/i, force: 'CRPF', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // Constable
  { pattern: /^CRPF-CST-\d{4}$/i, force: 'CRPF', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'Field Deployment', sector: 'Multiple Sectors' },
  { pattern: /^CRPF-CONST-\d{4}$/i, force: 'CRPF', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'Field Deployment', sector: 'Multiple Sectors' },
  // CoBRA (Special Ops)
  { pattern: /^CRPF-COBRA-\d{4}$/i, force: 'CRPF', rank: 'Inspector / Subedar', rankTier: 'subedar', role: 'subordinate_officer', unit: '209 CoBRA Bn (Special Ops)', location: 'Chhattisgarh / Jharkhand', sector: 'Left Wing Extremism Zone' },
  // Medical Cadre
  { pattern: /^CRPF-MED-\d{4}$/i, force: 'CRPF', rank: 'Medical Officer', rankTier: 'medical_officer', role: 'welfare_officer', unit: 'Composite Hospital', location: 'Field Medical Station', sector: 'Medical Directorate' },
  { pattern: /^CRPF-SRMO-\d{4}$/i, force: 'CRPF', rank: 'Senior Medical Officer', rankTier: 'sr_medical_officer', role: 'welfare_officer', unit: 'Composite Hospital', location: 'Field Medical Station', sector: 'Medical Directorate' },
  { pattern: /^CRPF-CMO-\d{4}$/i, force: 'CRPF', rank: 'Chief Medical Officer (CMO)', rankTier: 'chief_medical_officer', role: 'welfare_officer', unit: 'Central Hospital', location: 'New Delhi', sector: 'Medical Directorate' },

  // ── BSF ──────────────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^BSF-DIG-\d{4}$/i, force: 'BSF', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, Punjab Frontier', location: 'Punjab', sector: 'Punjab Frontier' },
  { pattern: /^BSF-IG-\d{4}$/i, force: 'BSF', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, BSF HQ', location: 'New Delhi', sector: 'BSF HQ' },
  // Commandant Level
  { pattern: /^BSF-CMD-\d{4}$/i, force: 'BSF', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Border Sector)', location: 'Punjab / Rajasthan / Gujarat', sector: 'Punjab/Rajasthan/Gujarat Frontier' },
  { pattern: /^BSF-CO-\d{4}$/i, force: 'BSF', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Border Sector)', location: 'Punjab / Rajasthan / Gujarat', sector: 'Punjab/Rajasthan/Gujarat Frontier' },
  // 2IC / Dy Commandant
  { pattern: /^BSF-2IC-\d{4}$/i, force: 'BSF', rank: 'Second-in-Command (2IC)', rankTier: '2ic', role: 'commander', unit: 'Bn HQ (Operations)', location: 'Border Sector', sector: 'Multiple Frontiers' },
  { pattern: /^BSF-DY-\d{4}$/i, force: 'BSF', rank: 'Deputy Commandant', rankTier: 'dy_commandant', role: 'commander', unit: 'Bn HQ (Administration)', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Assistant Commandant
  { pattern: /^BSF-AC-\d{4}$/i, force: 'BSF', rank: 'Assistant Commandant', rankTier: 'asst_commandant', role: 'commander', unit: 'Company Command', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Subedar Major
  { pattern: /^BSF-SM-\d{4}$/i, force: 'BSF', rank: 'Subedar Major', rankTier: 'subedar_major', role: 'subordinate_officer', unit: 'Bn HQ, Company', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Sub-Inspector
  { pattern: /^BSF-SI-\d{4}$/i, force: 'BSF', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // ASI
  { pattern: /^BSF-ASI-\d{4}$/i, force: 'BSF', rank: 'Assistant Sub-Inspector (ASI)', rankTier: 'asi', role: 'subordinate_officer', unit: 'Section Command', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Head Constable
  { pattern: /^BSF-HC-\d{4}$/i, force: 'BSF', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Constable
  { pattern: /^BSF-CST-\d{4}$/i, force: 'BSF', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'Border Sector', sector: 'Multiple Frontiers' },
  // Medical
  { pattern: /^BSF-MED-\d{4}$/i, force: 'BSF', rank: 'Medical Officer', rankTier: 'medical_officer', role: 'welfare_officer', unit: 'Composite Hospital', location: 'BSF Hospital', sector: 'Medical Directorate' },
  { pattern: /^BSF-CMO-\d{4}$/i, force: 'BSF', rank: 'Chief Medical Officer (CMO)', rankTier: 'chief_medical_officer', role: 'welfare_officer', unit: 'Central Hospital', location: 'New Delhi', sector: 'Medical Directorate' },

  // ── ITBP ─────────────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^ITBP-DIG-\d{4}$/i, force: 'ITBP', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, Northern Sector', location: 'Himachal Pradesh', sector: 'Northern Sector' },
  { pattern: /^ITBP-IG-\d{4}$/i, force: 'ITBP', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, ITBP HQ', location: 'New Delhi', sector: 'ITBP HQ' },
  // Commandant Level
  { pattern: /^ITBP-CMD-\d{4}$/i, force: 'ITBP', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Himalayan Sector)', location: 'Ladakh / Himachal Pradesh / Uttarakhand', sector: 'Himalayan Sectors' },
  // 2IC / Dy Commandant
  { pattern: /^ITBP-2IC-\d{4}$/i, force: 'ITBP', rank: 'Second-in-Command (2IC)', rankTier: '2ic', role: 'commander', unit: 'Bn HQ (Operations)', location: 'Himalayan Sector', sector: 'Himalayan Sectors' },
  // Subedar Major (High Altitude Specialist)
  { pattern: /^ITBP-SM-\d{4}$/i, force: 'ITBP', rank: 'Subedar Major (High Altitude)', rankTier: 'subedar_major', role: 'subordinate_officer', unit: 'Bn HQ, Company (High Altitude)', location: 'Leh-Ladakh / Siachen', sector: 'Himalayan Sectors' },
  // SI
  { pattern: /^ITBP-SI-\d{4}$/i, force: 'ITBP', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command (High Altitude)', location: 'Himalayan Sector', sector: 'Himalayan Sectors' },
  // HC / Constable
  { pattern: /^ITBP-HC-\d{4}$/i, force: 'ITBP', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section (High Altitude)', location: 'Himalayan Sector', sector: 'Himalayan Sectors' },
  { pattern: /^ITBP-CST-\d{4}$/i, force: 'ITBP', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section (High Altitude)', location: 'Himalayan Sector', sector: 'Himalayan Sectors' },
  // Medical (High Altitude Specialist)
  { pattern: /^ITBP-MED-\d{4}$/i, force: 'ITBP', rank: 'Medical Officer (High Altitude)', rankTier: 'medical_officer', role: 'welfare_officer', unit: 'High Altitude Hospital', location: 'Leh-Ladakh', sector: 'Medical Directorate' },

  // ── CISF ─────────────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^CISF-DIG-\d{4}$/i, force: 'CISF', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, Industrial Security', location: 'New Delhi', sector: 'Industrial Security Zone' },
  { pattern: /^CISF-IG-\d{4}$/i, force: 'CISF', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, CISF HQ', location: 'New Delhi', sector: 'CISF HQ' },
  // Commandant Level
  { pattern: /^CISF-CMD-\d{4}$/i, force: 'CISF', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Unit HQ (Industrial/Metro Security)', location: 'Delhi / Mumbai / Kolkata / Chennai', sector: 'Industrial/Metro Security' },
  // Sub-Inspector
  { pattern: /^CISF-SI-\d{4}$/i, force: 'CISF', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Industrial Unit', sector: 'Industrial Security Zone' },
  // HC / Constable
  { pattern: /^CISF-HC-\d{4}$/i, force: 'CISF', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section', location: 'Industrial/MVIP Security', sector: 'Industrial/MVIP Security' },
  { pattern: /^CISF-CST-\d{4}$/i, force: 'CISF', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'Industrial/MVIP Security', sector: 'Industrial/MVIP Security' },

  // ── SSB ──────────────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^SSB-DIG-\d{4}$/i, force: 'SSB', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, Eastern Sector', location: 'Kolkata', sector: 'Eastern Sector' },
  { pattern: /^SSB-IG-\d{4}$/i, force: 'SSB', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, SSB HQ', location: 'New Delhi', sector: 'SSB HQ' },
  // Commandant Level
  { pattern: /^SSB-CMD-\d{4}$/i, force: 'SSB', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Border Sector)', location: 'Bihar / West Bengal / Odisha / Assam', sector: 'Eastern Border Sectors' },
  // Sub-Inspector
  { pattern: /^SSB-SI-\d{4}$/i, force: 'SSB', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command', location: 'Eastern Border Sector', sector: 'Eastern Border Sectors' },
  // HC / Constable
  { pattern: /^SSB-HC-\d{4}$/i, force: 'SSB', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section', location: 'Eastern Border Sector', sector: 'Eastern Border Sectors' },
  { pattern: /^SSB-CST-\d{4}$/i, force: 'SSB', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'Eastern Border Sector', sector: 'Eastern Border Sectors' },

  // ── Assam Rifles ─────────────────────────────────────────────────────────
  // DIG/IG Level
  { pattern: /^AR-DIG-\d{4}$/i, force: 'Assam Rifles', rank: 'Deputy Inspector General (DIG)', rankTier: 'dig', role: 'senior_command', unit: 'DIG Office, NE Sector', location: 'Shillong', sector: 'North-East Sector' },
  { pattern: /^AR-IG-\d{4}$/i, force: 'Assam Rifles', rank: 'Inspector General (IG)', rankTier: 'ig', role: 'senior_command', unit: 'IG Office, Assam Rifles HQ', location: 'Shillong', sector: 'North-East HQ' },
  // Commandant Level
  { pattern: /^AR-CMD-\d{4}$/i, force: 'Assam Rifles', rank: 'Commandant / CO', rankTier: 'commandant', role: 'commander', unit: 'Bn HQ (Counter-Insurgency)', location: 'Assam / Manipur / Nagaland / Mizoram', sector: 'North-East Sectors' },
  // Sub-Inspector
  { pattern: /^AR-SI-\d{4}$/i, force: 'Assam Rifles', rank: 'Sub-Inspector (SI)', rankTier: 'si', role: 'subordinate_officer', unit: 'Platoon Command', location: 'North-East Sector', sector: 'North-East Sectors' },
  // HC / Constable
  { pattern: /^AR-HC-\d{4}$/i, force: 'Assam Rifles', rank: 'Head Constable (HC)', rankTier: 'hc', role: 'personnel', unit: 'Section', location: 'North-East Sector', sector: 'North-East Sectors' },
  { pattern: /^AR-CST-\d{4}$/i, force: 'Assam Rifles', rank: 'Constable', rankTier: 'constable', role: 'personnel', unit: 'Section', location: 'North-East Sector', sector: 'North-East Sectors' },

  // ── NSG (Deputation Overlay) ─────────────────────────────────────────────
  // NSG Commandant (from parent force)
  { pattern: /^NSG-CMD-\d{4}$/i, force: 'NSG', rank: 'Commandant — NSG Deputation', rankTier: 'commandant', role: 'nsg_taskforce', unit: 'NSG Special Action Group (SAG) / Special Rangers Group (SRG)', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  { pattern: /^NSG-CO-\d{4}$/i, force: 'NSG', rank: 'Commandant — NSG Deputation', rankTier: 'commandant', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // 2IC NSG
  { pattern: /^NSG-2IC-\d{4}$/i, force: 'NSG', rank: '2IC — NSG Deputation', rankTier: '2ic', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // Dy Commandant NSG
  { pattern: /^NSG-DY-\d{4}$/i, force: 'NSG', rank: 'Deputy Commandant — NSG Deputation', rankTier: 'dy_commandant', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // AC NSG
  { pattern: /^NSG-AC-\d{4}$/i, force: 'NSG', rank: 'Assistant Commandant — NSG Deputation', rankTier: 'asst_commandant', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // Subedar NSG
  { pattern: /^NSG-SM-\d{4}$/i, force: 'NSG', rank: 'Subedar Major — NSG Deputation', rankTier: 'subedar_major', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // SI NSG
  { pattern: /^NSG-SI-\d{4}$/i, force: 'NSG', rank: 'Sub-Inspector — NSG Deputation', rankTier: 'si', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  // HC / Constable NSG
  { pattern: /^NSG-HC-\d{4}$/i, force: 'NSG', rank: 'Head Constable — NSG Deputation', rankTier: 'hc', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },
  { pattern: /^NSG-CST-\d{4}$/i, force: 'NSG', rank: 'Constable — NSG Deputation', rankTier: 'constable', role: 'nsg_taskforce', unit: 'NSG SAG/SRG', location: 'New Delhi (NSG HQ)', sector: 'Counter-Terrorism' },

  // ── MHA / Force HQ Analysts ────────────────────────────────────────────
  { pattern: /^MHA-ANA-\d{4}$/i, force: 'MHA CAPF HQ', rank: 'Data / Behavioral Analyst', rankTier: 'analyst', role: 'analyst', unit: 'HQ Directorate General (People Intelligence)', location: 'New Delhi', sector: 'MHA CAPF HQ' },
  { pattern: /^MHA-JRA-\d{4}$/i, force: 'MHA CAPF HQ', rank: 'Junior Data Analyst', rankTier: 'junior_analyst', role: 'analyst', unit: 'HQ Directorate General (People Intelligence)', location: 'New Delhi', sector: 'MHA CAPF HQ' },
  { pattern: /^MHA-SRA-\d{4}$/i, force: 'MHA CAPF HQ', rank: 'Senior Data Analyst', rankTier: 'sr_analyst', role: 'analyst', unit: 'HQ Directorate General (People Intelligence)', location: 'New Delhi', sector: 'MHA CAPF HQ' },
  { pattern: /^MHA-CDO-\d{4}$/i, force: 'MHA CAPF HQ', rank: 'Chief Data Officer', rankTier: 'chief_analyst', role: 'analyst', unit: 'HQ Directorate General (People Intelligence)', location: 'New Delhi', sector: 'MHA CAPF HQ' },
];

export interface LookupResult {
  found: boolean;
  force?: string;
  rank?: string;
  rankTier?: AllRankTier;
  role?: UserRole;
  unit?: string;
  location?: string;
  sector?: string;
}

export function lookupServiceId(serviceId: string): LookupResult {
  if (!serviceId || serviceId.trim().length < 4) {
    return { found: false };
  }

  const normalized = serviceId.trim().toUpperCase();

  for (const entry of SERVICE_ID_LOOKUP) {
    if (entry.pattern.test(normalized) || entry.pattern.test(normalized.replace(/-/g, ''))) {
      return {
        found: true,
        force: entry.force,
        rank: entry.rank,
        rankTier: entry.rankTier,
        role: entry.role,
        unit: entry.unit,
        location: entry.location,
        sector: entry.sector,
      };
    }
  }

  // Fuzzy match fallback: try to extract force prefix
  const forceMatch = normalized.match(/^(CRPF|BSF|ITBP|CISF|SSB|AR|NSG|MHA|BSF)/i);
  if (forceMatch) {
    const force = forceMatch[1].toUpperCase();
    return {
      found: true,
      force: force === 'AR' ? 'Assam Rifles' : force,
      rank: 'Unknown Rank',
      rankTier: 'constable',
      role: 'personnel',
      unit: 'Auto-detected Force',
      location: 'Field Deployment',
      sector: 'Auto-detected',
    };
  }

  return { found: false };
}

export function generateRandomServiceId(force: string, rankPrefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000).toString();
  return `${force}-${rankPrefix}-${num}`;
}
