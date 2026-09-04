import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { isTabAccessible, NAV_CONFIG, getDefaultTabForRole } from '../../config/navConfig';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Shield,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ProtectedRouteProps {
  tabId: string;
  children: React.ReactNode;
  onNavigate: (tabId: string) => void;
}

const ROLE_RESTRICTION_EXPLANATIONS: Record<UserRole, Record<string, string>> = {
  personnel: {
    analytics: 'Predictive battalion-level burnout curves and unit saturation indices are restricted to Commanding Officers, Medical Specialists, and Analysts.',
    interventions: 'Battalion rest rotation authorizations and clinical triage directive consoles are restricted to Commanding Officers and Medical Officers.',
    datasets: 'Raw synthetic dataset generation and multi-force telemetry exports are reserved exclusively for Behavioral Data Analysts.',
    impact: 'Strategic force readiness indicators and mission capacity metrics are restricted to Command level.',
    'supabase-data': 'PostgreSQL Row-Level Security schema auditing tools are restricted to Behavioral Data Analysts.',
  },
  commander: {
    dashboard: 'Individual personnel biometrics and live PPG/SpO2 waveforms are hidden to protect jawan psychological sovereignty under the Armed Forces Welfare Doctrine.',
    assessment: 'Private voluntary PHQ-9 mental stamina screenings are strictly confidential to prevent evaluation or appraisal bias.',
    datasets: 'Raw data pipeline manipulation is restricted to Behavioral Data Analysts.',
    integrations: 'Direct hardware sensor pairing is managed by frontline jawans and medical staff.',
    'supabase-data': 'Postgres schema auditing tools are restricted to Data Analysts.',
  },
  welfare_officer: {
    assessment: 'Individual raw self-assessment intake forms are submitted privately by personnel; Medical Officers review aggregated clinical triage alerts.',
    privacy: 'System-level differential privacy parameter configurations are managed by Data Analysts.',
    datasets: 'Raw model training datasets are restricted to Behavioral Data Analysts.',
    impact: 'Macro battalion readiness strategic reports are directed to Commanding Officers.',
    'supabase-data': 'Database schema auditing is restricted to Data Analysts.',
  },
  analyst: {
    dashboard: 'Identified individual biometrics are masked under k-anonymity (k=5) to preserve non-traceability.',
    assessment: 'Voluntary self-assessment forms are private to frontline personnel.',
    interventions: 'Operational troop rest rotation commands are authorized strictly by Battalion Commanding Officers.',
    integrations: 'Tactical device pairing is handled on-site by field units.',
  },
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  tabId,
  children,
  onNavigate,
}) => {
  const { role, user, openAuthModal, switchRole } = useAuth();
  const [countdown, setCountdown] = useState<number>(6);

  const isAllowed = isTabAccessible(tabId, role);
  const targetTab = NAV_CONFIG.find((t) => t.id === tabId);

  useEffect(() => {
    if (isAllowed) return;

    setCountdown(6);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onNavigate(getDefaultTabForRole(role));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAllowed, tabId, role, onNavigate]);

  if (isAllowed) {
    return <>{children}</>;
  }

  const roleExplanation =
    ROLE_RESTRICTION_EXPLANATIONS[role]?.[tabId] ||
    'This module requires elevated military clearance or distinct operational authority not granted to the active persona.';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="p-6 md:p-12 max-w-3xl mx-auto my-8 rounded-3xl bg-olive-950/90 border border-rose-500/50 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden"
    >
      {/* Background ambient red glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-6 border-b border-olive-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CLEARANCE RESTRICTION
              </span>
              <span className="text-xs text-olive-400 font-mono">
                RBAC Level: <strong className="text-white uppercase">{role}</strong>
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight mt-1">
              Access Denied: Restrained under Welfare Doctrine & Zero-Trust RBAC Policy
            </h2>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="py-6 space-y-5">
        <div className="p-4 rounded-2xl bg-olive-900/60 border border-olive-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono text-accent-gold font-bold">
            <span>Target Module: {targetTab?.label || tabId}</span>
            <span className="text-olive-400 font-normal">ID: {user.serviceNumber}</span>
          </div>
          <p className="text-slate-200 leading-relaxed text-xs">
            {roleExplanation}
          </p>
        </div>

        {/* Welfare Doctrine Legal Guarantee */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-olive-950 to-olive-900 border border-accent-gold/30 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-[11px]">
            <Shield className="w-4 h-4 text-accent-gold" />
            <span>Armed Forces Welfare Doctrine (§ 108.4 Privacy Charter)</span>
          </div>
          <p className="text-[11px] text-olive-300 leading-relaxed">
            Data separation ensures physiological health observations cannot be used for disciplinary actions or performance appraisals. Each persona is restricted strictly to their clinical or tactical scope.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-olive-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-olive-400 font-mono text-center sm:text-left">
          Auto-redirecting to authorized home grid in{' '}
          <span className="font-bold text-accent-gold">{countdown}s</span>…
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate(getDefaultTabForRole(role))}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Return to Authorized Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openAuthModal}
            className="px-4 py-2.5 rounded-xl bg-olive-900 hover:bg-olive-800 border border-olive-700 text-slate-200 text-xs font-bold font-mono transition-colors"
          >
            Clearance Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};
