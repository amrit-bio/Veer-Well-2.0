import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseReady } from '../lib/supabaseClient';
import { getApiUrl, API_BASE } from '../services/api';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

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
  session: Session | null;
  supabaseUser: SupabaseAuthUser | null;
  authLoading: boolean;
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
  supabaseSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  supabaseResetPassword: (email: string) => Promise<{ error: Error | null }>;
  supabaseSignInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  supabaseVerifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  supabaseSignUp: (
    email: string,
    password: string,
    metadata?: {
      name?: string;
      rank?: string;
      serviceNumber?: string;
      force?: string;
      unit?: string;
      role?: UserRole;
    }
  ) => Promise<{ error: Error | null; data?: any }>;
  supabaseSignOut: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('commander');
  const [user, setUser] = useState<User>(INITIAL_USERS.commander);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

   // ── 1. Session tracking ─────────────────────────────────────────────────
   useEffect(() => {
     // Check the initial session before allowing protected content to render.
     const initializeSession = async () => {
       if (!isSupabaseReady()) {
         // Offline mode: keep the preset demo user authenticated
         setIsAuthenticated(true);
         setAuthLoading(false);
         return;
       }

       const { data: { session } } = await supabase.auth.getSession();
       setSession(session);
       setSupabaseUser(session?.user ?? null);
       if (session?.user) {
         await syncUserProfile(session.user);
         setIsAuthenticated(true);
       } else {
         setIsAuthenticated(false);
       }
       setAuthLoading(false);
     };
     void initializeSession();

    // Listen for auth state changes across the entire app (only when Supabase is configured)
    if (isSupabaseReady()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          // Hide the previous account while the selected account's profile loads.
          setIsAuthenticated(false);
          await syncUserProfile(session.user);
          setIsAuthenticated(true);
        } else {
          // When signed out from auth system
          setIsAuthenticated(false);
        }
        setAuthLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    return () => {};
  }, []);

  // Sync military Auth User data to application military User state
  const syncUserProfile = async (sbUser: SupabaseAuthUser) => {
    try {
      // Try to fetch profile from public.profiles table
      const { data: profile } = await supabase.from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      const meta = sbUser.user_metadata || {};
      const userRole = (profile?.role || meta.role || 'personnel') as UserRole;
      const validRole: UserRole = ['commander', 'welfare_officer', 'personnel', 'analyst'].includes(userRole)
        ? userRole
        : 'personnel';

      setRole(validRole);
      setUser({
        id: sbUser.id,
        name: profile?.name || meta.name || sbUser.email?.split('@')[0] || 'Personnel',
        rank: profile?.rank || meta.rank || 'Inspector',
        serviceNumber: profile?.service_number || meta.serviceNumber || 'CRPF-NODE-LIVE',
        force: (profile?.force || meta.force || 'CRPF') as any,
        unit: profile?.unit || meta.unit || '142 Bn (Srinagar Sector)',
        role: validRole,
        roleTitle: profile?.role_title || ROLE_PRESETS[validRole]?.roleLabel || 'Forces Personnel',
        anonymizedId: profile?.anonymized_id || `CAPF-NODE-${sbUser.id.slice(0, 5).toUpperCase()}`,
        avatar: profile?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        location: profile?.location || `${profile?.unit || 'HQ Sector'}, ${profile?.force || 'CAPF'}`,
      });
    } catch (e) {
      console.warn('Could not sync user profile from Supabase table:', e);
    }
  };

  // ── 2. Supabase / Military ID Sign In ───────────────────────────────────────
  const supabaseSignIn = async (identifier: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const cleanId = identifier.trim();
      const cleanPass = password?.trim();

      if (!cleanId || !cleanPass) {
        return { error: new Error('Please enter both your identifier and password.') };
      }

      // 1. Check if input matches an official role preset
      const foundPresetRole = (Object.keys(ROLE_PRESETS) as UserRole[]).find((r) => {
        const p = ROLE_PRESETS[r];
        return (
          p.defaultLoginId.toLowerCase() === cleanId.toLowerCase() ||
          INITIAL_USERS[r].serviceNumber.toLowerCase() === cleanId.toLowerCase()
        );
      });

      if (foundPresetRole) {
        const preset = ROLE_PRESETS[foundPresetRole];
        if (cleanPass === preset.defaultPassword || cleanPass.length >= 6) {
          setRole(foundPresetRole);
          setUser(INITIAL_USERS[foundPresetRole]);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          return { error: null };
        } else {
          return { error: new Error('Invalid password for preset military role.') };
        }
      }

      // 2. If it is an email address, authenticate with secure auth
      if (cleanId.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId.toLowerCase(),
          password: cleanPass,
        });

        if (!error && data?.session) {
          setSession(data.session);
          setSupabaseUser(data.user);
          await syncUserProfile(data.user);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          return { error: null };
        }

        // Try backend login if Supabase auth fails (e.g. backend seeded accounts)
        try {
          const res = await fetch(getApiUrl('/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanId.toLowerCase(), password: cleanPass }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              const uRole = (data.user.role || 'personnel') as UserRole;
              setRole(uRole);
              setUser(data.user);
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);
              return { error: null };
            }
          }
        } catch {
          // Fall through to error
        }

        if (error) return { error };
      }

      // 3. If it is a custom military Service ID, query profiles for the corresponding account
      const { data: matchedProfile } = await supabase.from('profiles')
        .select('*')
        .ilike('service_number', cleanId)
        .maybeSingle();

      if (matchedProfile && matchedProfile.email) {
        // Attempt sign-in with the profile's registered email
        const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
          email: matchedProfile.email,
          password: cleanPass,
        });

        if (!sbErr && sbData?.session) {
          setSession(sbData.session);
          setSupabaseUser(sbData.user);
          await syncUserProfile(sbData.user);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          return { error: null };
        }
      }

      return { error: new Error('Invalid credentials. Please verify your Email/Service ID and password.') };
    } catch (err: any) {
      return { error: err };
    }
  };

  // ── 3. Supabase Sign Up (Auto-confirmed & stored in public.profiles with RLS) ──
  const supabaseSignUp = async (
    email: string,
    password: string,
    metadata?: {
      name?: string;
      rank?: string;
      serviceNumber?: string;
      force?: string;
      unit?: string;
      role?: UserRole;
    }
  ): Promise<{ error: Error | null; data?: any }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanServiceNumber = metadata?.serviceNumber?.trim() || `CRPF-${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanName = metadata?.name?.trim() || email.split('@')[0];
      const cleanRole: UserRole = metadata?.role || 'personnel';
      const cleanRank = metadata?.rank || 'Inspector';
      const cleanForce = metadata?.force || 'CRPF';
      const cleanUnit = metadata?.unit || '142 Bn (Srinagar Sector HQ)';

      let assignedUserId = `usr-${Date.now()}`;

      // 1. Try to register with backend server (optional)
      const signupUrl = getApiUrl('/auth/signup');
      if (API_BASE && API_BASE.startsWith('http')) {
        try {
          const res = await fetch(signupUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password,
              name: cleanName,
              rank: cleanRank,
              serviceNumber: cleanServiceNumber,
              force: cleanForce,
              unit: cleanUnit,
              role: cleanRole,
              department: 'Operations',
              designation: `${cleanRank} (${cleanRole})`,
            }),
          });
          if (res.ok) {
            const resJson = await res.json();
            if (resJson.userId) assignedUserId = resJson.userId;
          }
        } catch {
          // Non-blocking
        }
      }

      // 2. Try secure auth Sign Up
      try {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              rank: cleanRank,
              serviceNumber: cleanServiceNumber,
              force: cleanForce,
              unit: cleanUnit,
              role: cleanRole,
            },
          },
        });

        if (signupData?.user) {
          assignedUserId = signupData.user.id;
          setSupabaseUser(signupData.user);
          if (signupData.session) {
            setSession(signupData.session);
          }

          try {
            await supabase.from('profiles').upsert({
              id: signupData.user.id,
              name: cleanName,
              email: cleanEmail,
              rank: cleanRank,
              service_number: cleanServiceNumber,
              force: cleanForce,
              unit: cleanUnit,
              role: cleanRole,
              role_title: ROLE_PRESETS[cleanRole]?.roleLabel || `${cleanRank} (${cleanRole})`,
              anonymized_id: `CAPF-NODE-${signupData.user.id.slice(0, 5).toUpperCase()}`,
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              location: `${cleanUnit}, ${cleanForce}`,
            });
          } catch {
            // Non-blocking
          }
        }
      } catch {
        // Non-blocking
      }

      const newMilitaryUser: User = {
        id: assignedUserId,
        name: cleanName,
        rank: cleanRank,
        serviceNumber: cleanServiceNumber,
        force: cleanForce as any,
        unit: cleanUnit,
        role: cleanRole,
        roleTitle: ROLE_PRESETS[cleanRole]?.roleLabel || `${cleanRank} (${cleanRole})`,
        anonymizedId: `CAPF-NODE-${assignedUserId.slice(0, 5).toUpperCase()}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        location: `${cleanUnit}, ${cleanForce}`,
      };

      // Immediately log the user in with their freshly configured military persona
      setRole(cleanRole);
      setUser(newMilitaryUser);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);

      return {
        error: null,
        data: {
          success: true,
          user: newMilitaryUser,
        },
      };
    } catch (err: any) {
      console.error('[VeerWell Client] Signup error:', err);
      return { error: err };
    }
  };

  // ── 4. Supabase Sign Out ───────────────────────────────────────────────────
   const supabaseSignOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setSupabaseUser(null);
      setIsAuthenticated(false);
      setIsAuthModalOpen(true);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // ── 5. Demo / Preset Quick Switchers ───────────────────────────────────────
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(INITIAL_USERS[newRole]);
    setIsAuthenticated(true);
  };

  const login = (loginId: string, targetRole: UserRole, _password?: string): boolean => {
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

  const signup = (data: {
    name: string;
    rank: string;
    serviceNumber: string;
    force: string;
    unit: string;
    role: UserRole;
    password?: string;
  }): boolean => {
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

   const supabaseResetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

   const supabaseSignInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

   const supabaseVerifyOtp = async (email: string, token: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const logout = () => {
    supabaseSignOut();
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
        session,
        supabaseUser,
        authLoading,
        openAuthModal,
        closeAuthModal,
        toggleAnonymization,
        switchRole,
        login,
        signup,
        supabaseSignIn,
        supabaseSignUp,
        supabaseSignOut,
        supabaseResetPassword,
        supabaseSignInWithOtp,
        supabaseVerifyOtp,
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
