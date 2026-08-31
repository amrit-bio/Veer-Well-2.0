import React from 'react';
import { motion } from 'framer-motion';
import { Wordmark } from '../common/Wordmark';
import { LoginHero3D } from '../3d/LoginHero3D';
import { useAuth, ROLE_PRESETS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Shield,
  Activity,
  HeartPulse,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  FileCheck2,
  Cpu,
  Award,
  Zap,
  LogIn,
  UserPlus,
  Key,
  CheckCircle2,
} from 'lucide-react';

export const HomeOverviewTab: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { role: currentRole, user: currentUser, login, openAuthModal } = useAuth();

  const handleRoleQuickLogin = (roleKey: UserRole) => {
    const preset = ROLE_PRESETS[roleKey];
    login(preset.defaultLoginId, roleKey, preset.defaultPassword);
    if (roleKey === 'commander') onNavigate('dashboard');
    else if (roleKey === 'welfare_officer') onNavigate('interventions');
    else if (roleKey === 'personnel') onNavigate('assessment');
    else if (roleKey === 'analyst') onNavigate('analytics');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative glass-panel rounded-3xl p-6 md:p-10 border border-olive-400/30 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-gold/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-olive-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-5">
            <Wordmark size="lg" showSubtitle />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-900/90 border border-accent-gold/40 text-accent-gold text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-accent-gold" />
              <span>Dedicated to CAPF, CRPF, BSF, ITBP & Central Armed Forces</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Stress Intelligence & Welfare Analytics for{' '}
              <span className="text-gradient-gold font-devanagari">वीर</span> Forces
            </h1>

            <p className="text-sm md:text-base text-olive-100/90 leading-relaxed max-w-2xl">
              वीरWell is an AI-powered proactive wellness telemetry and workforce resilience platform built for frontline personnel. Combining wearable physiological signals, duty rotation logs, and voluntary psychological surveys with cryptographic anonymization.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron hover:opacity-95 text-navy-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
              >
                <span>Explore Operational Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={openAuthModal}
                className="px-5 py-3 rounded-xl bg-olive-900/90 hover:bg-olive-800 border border-accent-gold/40 text-accent-gold font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md"
              >
                <Key className="w-4 h-4 text-accent-gold" />
                <span>Military Login / Register</span>
              </button>

              <button
                onClick={() => onNavigate('assessment')}
                className="px-5 py-3 rounded-xl bg-olive-950/80 hover:bg-olive-900 border border-olive-500/30 text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Take Self-Assessment</span>
              </button>
            </div>
          </div>

          {/* Right 3D Visual Centerpiece */}
          <div className="lg:col-span-5 h-72 md:h-84 glass-card rounded-2xl border border-olive-400/30 p-2 relative flex items-center justify-center overflow-hidden">
            <LoginHero3D />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-olive-200 bg-olive-950/80 px-2.5 py-1 rounded-lg border border-olive-600/40 backdrop-blur-md">
              <span>🛡️ AI Bio-Telemetry Node</span>
              <span>100% Anonymized Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Military Access Grid (Distinct Logins & Roles) */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-olive-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                Multi-Persona RBAC Access Control
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Select Military Persona & Authenticate by Login ID
            </h2>
            <p className="text-xs text-olive-300 mt-0.5">
              Each role possesses unique military credentials, granular access scopes, and duty responsibilities.
            </p>
          </div>

          <button
            onClick={openAuthModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Open Login / Signup Portal</span>
          </button>
        </div>

        {/* 4 Distinct Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Commander */}
          <div className="glass-card p-5 rounded-2xl border border-accent-gold/40 space-y-3 bg-olive-950/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-accent-gold/20 text-accent-gold flex items-center justify-center border border-accent-gold/40">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-olive-900 text-accent-gold border border-olive-700">
                  ID: CRPF-CMD-7801
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Commanding Officer</h3>
              <p className="text-[11px] text-olive-200 leading-relaxed">
                Battalion aggregate readiness, rest rotation authorizations, and high-altitude operational heatmap tracking.
              </p>
            </div>
            <button
              onClick={() => handleRoleQuickLogin('commander')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'commander'
                  ? 'bg-accent-gold text-navy-950 font-black shadow-md'
                  : 'bg-olive-900 text-white hover:bg-olive-800 border border-olive-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentRole === 'commander' ? 'Active Session' : 'Login as Commander'}</span>
            </button>
          </div>

          {/* Card 2: Medical & Welfare Officer */}
          <div className="glass-card p-5 rounded-2xl border border-rose-500/40 space-y-3 bg-olive-950/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-olive-900 text-rose-300 border border-olive-700">
                  ID: CRPF-MED-8492
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Medical & Welfare Officer</h3>
              <p className="text-[11px] text-olive-200 leading-relaxed">
                Prescribe 48h hypoxia recovery respite, psychological debriefings, and clinical counseling under doctor-patient privilege.
              </p>
            </div>
            <button
              onClick={() => handleRoleQuickLogin('welfare_officer')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'welfare_officer'
                  ? 'bg-rose-500 text-white font-black shadow-md'
                  : 'bg-olive-900 text-white hover:bg-olive-800 border border-olive-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentRole === 'welfare_officer' ? 'Active Session' : 'Login as Medical Officer'}</span>
            </button>
          </div>

          {/* Card 3: Frontline Personnel (Jawan) */}
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 space-y-3 bg-olive-950/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-olive-900 text-emerald-300 border border-olive-700">
                  ID: CRPF-COBRA-1042
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Frontline Personnel (Jawan)</h3>
              <p className="text-[11px] text-olive-200 leading-relaxed">
                Voluntary PHQ-9 self-assessment, smartwatch PPG/SpO2 sync, and 3-day confidential Wellness Recharge leave requests.
              </p>
            </div>
            <button
              onClick={() => handleRoleQuickLogin('personnel')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'personnel'
                  ? 'bg-emerald-500 text-navy-950 font-black shadow-md'
                  : 'bg-olive-900 text-white hover:bg-olive-800 border border-olive-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentRole === 'personnel' ? 'Active Session' : 'Login as Jawan'}</span>
            </button>
          </div>

          {/* Card 4: Behavioral Data Scientist */}
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/40 space-y-3 bg-olive-950/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-olive-900 text-cyan-300 border border-olive-700">
                  ID: MHA-ANA-9104
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Behavioral Data Scientist</h3>
              <p className="text-[11px] text-olive-200 leading-relaxed">
                14-day multi-variate predictive regression models, What-If roster stress simulations, and differential privacy data sets.
              </p>
            </div>
            <button
              onClick={() => handleRoleQuickLogin('analyst')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                currentRole === 'analyst'
                  ? 'bg-cyan-500 text-navy-950 font-black shadow-md'
                  : 'bg-olive-900 text-white hover:bg-olive-800 border border-olive-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentRole === 'analyst' ? 'Active Session' : 'Login as Data Analyst'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Problem Statement vs Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-rose-500/30 space-y-3 bg-gradient-to-br from-olive-950 via-rose-950/15 to-olive-950">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>The Strategic Challenge</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            High-Tempo Deployments & Silent Fatigue Accumulation
          </h2>
          <ul className="space-y-2 text-xs text-olive-200/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Extended border rotations in extreme climates (Siachen, Leh, Thar) without continuous physiological recovery tracking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Stigma around voluntary mental fatigue disclosure due to fear of disciplinary impact on duty deployment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>Fragmented HR rosters unable to correlate duty shift saturation with sleep deficit and HRV decline.</span>
            </li>
          </ul>
        </div>

        {/* Solution Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/30 space-y-3 bg-gradient-to-br from-olive-950 via-emerald-950/15 to-olive-950">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>The VeerWell Solution</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Proactive Bio-Intelligence & The Welfare Doctrine
          </h2>
          <ul className="space-y-2 text-xs text-olive-200/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Multi-sensor smartwatch telemetry capturing heart rate variability, SpO2, and deep sleep architecture.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Strict Welfare Doctrine governance: System policy blocks data from disciplinary actions or appraisal marks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Predictive analytics engine providing 7–14 day advance warnings for early clinical and roster interventions.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Key Highlights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Core Architecture Highlights
            </h2>
            <p className="text-xs text-olive-300">Key pillars engineered for Central Armed Police Forces</p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highlight 1: AI Stress Monitoring */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('dashboard')}
            className="glass-panel p-6 rounded-2xl border border-olive-400/25 hover:border-accent-gold transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/40 text-accent-gold flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI-Driven Stress Monitoring</h3>
            <p className="text-xs text-olive-200 leading-relaxed">
              Real-time physiological modeling analyzing sympathetic vs parasympathetic tone, predicting burnout 7–14 days before clinical manifestation.
            </p>
            <div className="text-accent-gold text-xs font-bold flex items-center gap-1">
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Highlight 2: Privacy Safeguards */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('privacy')}
            className="glass-panel p-6 rounded-2xl border border-olive-400/25 hover:border-accent-gold transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Privacy & Welfare Doctrine</h3>
            <p className="text-xs text-olive-200 leading-relaxed">
              K-Anonymity and Differential Privacy ensure Commanders view aggregated battalion health, protecting individual personnel identities.
            </p>
            <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span>Explore Safeguards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Highlight 3: Wearables & HRMS */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('integrations')}
            className="glass-panel p-6 rounded-2xl border border-olive-400/25 hover:border-accent-gold transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tactical Wearable Sync</h3>
            <p className="text-xs text-olive-200 leading-relaxed">
              Seamless integration with tactical smartwatches, military PPG patches, and HRMS roster schedules for 30–90 day biometric timelines.
            </p>
            <div className="text-cyan-400 text-xs font-bold flex items-center gap-1">
              <span>View Integrations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
