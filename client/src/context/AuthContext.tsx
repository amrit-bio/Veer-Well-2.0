import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export interface RoleCredentials {
  role: UserRole;
  roleLabel: string;
  defaultLoginId: string;
  defaultPassword: string;
  rank: string;
  name: string;
  force: string;
  unit: string;
  badge: string;
  description: string;
}

export const ROLE_PRESETS: Record<UserRole, RoleCredentials> = {
  commander: {
    role: 'commander',
    roleLabel: 'Commanding Officer (CO)',
    defaultLoginId: 'CRPF-CMD-7801',
    defaultPassword: 'co-password-2026',
    rank: 'Commandant / CO',
    name: 'Col. Devendra Singh Rathore',
    force: 'CRPF',
    unit: '142 Bn (Srinagar Sector HQ)',
    badge: 'Strategic Battalion Command',
    description: 'Battalion Readiness, Rest Approvals, Macro Operational Fatigue Heatmaps (Names Masked).',
  },
  welfare_officer: {
    role: 'welfare_officer',
    roleLabel: 'Medical & Welfare Officer',
    defaultLoginId: 'CRPF-MED-8492',
    defaultPassword: 'med-password-2026',
    rank: 'Chief Medical & Welfare Officer',
    name: 'Dr. Aryan Verma',
    force: 'CRPF Medical Directorate',
    unit: 'Central Composite Hospital, Srinagar',
    badge: 'Clinical Welfare & Directives',
    description: 'Prescribe 48h Recovery Respite, Clinical Counseling Scripts, Post-Mission Debriefs.',
  },
  personnel: {
    role: 'personnel',
    roleLabel: 'Frontline Sentinel (Jawan / Inspector)',
    defaultLoginId: 'CRPF-COBRA-1042',
    defaultPassword: 'jawan-password-2026',
    rank: 'Inspector (Field Command)',
    name: 'Inspector Vikramaditya Shrestha',
    force: 'CRPF',
    unit: '209 CoBRA Bn (Special Ops)',
    badge: 'Personal Biometrics & Sovereignty',
    description: 'Confidential PHQ-9 Screener, Live Smartwatch Telemetry Sync, 3-Day Wellness Leave Request.',
  },
  analyst: {
    role: 'analyst',
    roleLabel: 'Behavioral Data Scientist',
    defaultLoginId: 'MHA-ANA-9104',
    defaultPassword: 'ana-password-2026',
    rank: 'Lead Behavioral Scientist',
    name: 'Pooja Deshmukh',
    force: 'MHA CAPF HQ',
    unit: 'HQ Directorate General (People Intelligence)',
    badge: 'Differential Privacy Analytics',
    description: 'Multi-variate 14-Day Predictive Burnout Regression, Roster What-If Simulation Models.',
  },
};

const INITIAL_USERS: Record<UserRole, User> = {
  commander: {
    id: 'usr-co-01',
    name: 'Col. Devendra Singh Rathore',
    rank: 'Commandant / Commanding Officer',
    serviceNumber: 'CRPF-CMD-7801',
    force: 'CRPF',
    unit: '142 Bn (Srinagar Sector HQ)',
    role: 'commander',
    roleTitle: 'Battalion Commanding Officer',
    anonymizedId: 'CAPF-CMD-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Srinagar Sector Command, J&K',
  },
  welfare_officer: {
    id: 'usr-wo-02',
    name: 'Dr. Aryan Verma',
    rank: 'Chief Medical & Welfare Officer',
    serviceNumber: 'CRPF-MED-8492',
    force: 'CRPF',
    unit: 'Central Composite Hospital, Srinagar',
    role: 'welfare_officer',
    roleTitle: 'Unit Welfare & Psychological Specialist',
    anonymizedId: 'CAPF-MED-02',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Field Medical Station, Leh-Ladakh Sector',
  },
  personnel: {
    id: 'usr-jawan-03',
    name: 'Inspector Vikramaditya Shrestha',
    rank: 'Inspector (Field Command)',
    serviceNumber: 'CRPF-COBRA-1042',
    force: 'CRPF',
    unit: '209 CoBRA Bn (Special Ops)',
    role: 'personnel',
    roleTitle: 'Tactical Reconnaissance Lead',
    anonymizedId: 'CAPF-NODE-1042',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Forward Post Delta, Siachen Border Area',
  },
  analyst: {
    id: 'usr-ana-04',
    name: 'Pooja Deshmukh',
    rank: 'Lead Behavioral Data Scientist',
    serviceNumber: 'MHA-ANA-9104',
    force: 'CAPF Command',
    unit: 'HQ Directorate General (People Intelligence)',
    role: 'analyst',
    roleTitle: 'Workforce Stress & Fatigue Analyst',
    anonymizedId: 'CAPF-ANA-04',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'MHA CAPF HQ, New Delhi',
  },
};

interface AuthContextType {
  user: User;
  role: UserRole;
  isAuthenticated: boolean;
  isAnonymized: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  toggleAnonymization: () => void;
  switchRole: (newRole: UserRole) => void;
  login: (loginId: string, role: UserRole, password?: string) => boolean;
  signup: (data: {
    name: string;
    rank: string;
    serviceNumber: string;
    force: string;
    unit: string;
    role: UserRole;
    password?: string;
  }) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('commander');
  const [user, setUser] = useState<User>(INITIAL_USERS.commander);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Switch role directly (e.g. quick selector)
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(INITIAL_USERS[newRole]);
    setIsAuthenticated(true);
  };

  // Login with credentials
  const login = (loginId: string, targetRole: UserRole, password?: string): boolean => {
    const matchedPreset = INITIAL_USERS[targetRole];
    if (matchedPreset) {
      setRole(targetRole);
      setUser({
        ...matchedPreset,
        serviceNumber: loginId || matchedPreset.serviceNumber,
      });
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  // Sign up a new user with custom military credentials
  const signup = (data: {
    name: string;
    rank: string;
    serviceNumber: string;
    force: string;
    unit: string;
    role: UserRole;
    password?: string;
  }): boolean => {
    // Generate deterministic anonymized hash
    let hash = 0;
    const key = `${data.serviceNumber}-${data.name}`;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const anonToken = `CAPF-NODE-${Math.abs(hash).toString(16).toUpperCase().slice(0, 5)}`;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      rank: data.rank,
      serviceNumber: data.serviceNumber,
      force: data.force,
      unit: data.unit,
      role: data.role,
      roleTitle: ROLE_PRESETS[data.role]?.roleLabel || 'Forces Personnel',
      anonymizedId: anonToken,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      location: `${data.unit}, ${data.force}`,
    };

    setRole(data.role);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
  };

  const toggleAnonymization = () => {
    setIsAnonymized((prev) => !prev);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAnonymized,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        toggleAnonymization,
        switchRole,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

