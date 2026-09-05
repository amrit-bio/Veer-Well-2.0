import React from 'react';
import { motion } from 'framer-motion';
import { Wordmark } from '../common/Wordmark';
import { useAuth } from '../../context/AuthContext';
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
  AlertTriangle,
  Flame,
  Stethoscope,
  PlaneTakeoff,
  Database,
  CalendarCheck,
  TrendingUp,
  LineChart,
  Radio,
  FileBadge,
} from 'lucide-react';

export const HomeOverviewTab: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { role: currentRole, user: currentUser, openAuthModal, isAnonymized, session } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── 1. Hero Header Banner ────────────────────────────────────────────── */}
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
              वीरWell (Rakshak AI) is an operational wellness telemetry and workforce resilience platform built for frontline personnel. Combining wearable physiological signals, duty rotation logs, and voluntary psychological surveys with cryptographic anonymization.
            </p>

            {/* Role-Specific Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {currentRole === 'personnel' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron hover:opacity-95 text-navy-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
                  >
                    <span>View My Live Biometrics</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('assessment')}
                    className="px-5 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs md:text-sm flex items-center gap-2 transition-all"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Confidential Check-In</span>
                  </button>
                </>
              )}

              {currentRole === 'commander' && (
                <>
                  <button
                    onClick={() => onNavigate('analytics')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-gold via-amber-400 to-accent-saffron hover:opacity-95 text-navy-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
                  >
                    <span>Inspect 14-Day Predictive Model</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('interventions')}
                    className="px-5 py-3 rounded-xl bg-olive-900/90 hover:bg-olive-800 border border-accent-gold/40 text-accent-gold font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Approve Rest Rotations</span>
                  </button>
                </>
              )}

              {currentRole === 'welfare_officer' && (
                <>
                  <button
                    onClick={() => onNavigate('interventions')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all transform active:scale-95"
                  >
                    <span>Prescribe Clinical Respite</span>
                    <Stethoscope className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-5 py-3 rounded-xl bg-olive-900/90 hover:bg-olive-800 border border-olive-700 text-slate-200 font-bold text-xs md:text-sm flex items-center gap-2 transition-all"
                  >
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Privileged Biometrics</span>
                  </button>
                </>
              )}

              {currentRole === 'analyst' && (
                <>
                  <button
                    onClick={() => onNavigate('analytics')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:opacity-95 text-navy-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
                  >
                    <span>Run Multivariate Regression</span>
                    <Cpu className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('datasets')}
                    className="px-5 py-3 rounded-xl bg-olive-900/90 hover:bg-olive-800 border border-olive-700 text-slate-200 font-bold text-xs md:text-sm flex items-center gap-2 transition-all"
                  >
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Simulated Datasets</span>
                  </button>
                </>
              )}

              <button
                onClick={openAuthModal}
                className="px-4 py-3 rounded-xl bg-olive-950/80 hover:bg-olive-900 border border-olive-700 text-olive-300 font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <Key className="w-3.5 h-3.5 text-accent-gold" />
                <span>Clearance Profile</span>
              </button>
            </div>
          </div>

          {/* Right Info Panel */}
          <div className="lg:col-span-5 glass-card rounded-2xl border border-olive-400/30 p-6 space-y-4">
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-gold">Your Profile</div>
              <div className="text-sm font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-olive-300 font-mono">{currentUser.serviceNumber}</div>
            </div>
            <div className="pt-2 border-t border-olive-800">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2">Status</div>
              <div className="flex items-center gap-2 text-xs text-olive-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Dynamic RBAC Persona Clearance Overview Widgets ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-gold animate-pulse" />
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
              Operational Command Deck • Clearance Tier: <span className="text-accent-gold uppercase font-mono">{currentRole}</span>
            </h2>
          </div>
          <span className="text-xs font-mono text-olive-400">
            Unit: <strong className="text-slate-200">{currentUser.unit}</strong>
          </span>
        </div>

        {/* 🟢 TIER 1: FRONTLINE PERSONNEL WIDGETS */}
        {currentRole === 'personnel' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-olive-950 to-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  SYNCED
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">64 <span className="text-xs font-normal text-olive-400">ms</span></div>
                <div className="text-xs font-bold text-slate-200">HRV Parasympathetic Tone</div>
                <p className="text-[10px] text-emerald-300 mt-1">Optimal recovery state post-shift</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-olive-700 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-olive-300">Live IoT</span>
              </div>
              <div>
                <div className="text-2xl font-black text-accent-gold font-mono">98.2 <span className="text-xs font-normal text-olive-400">%</span></div>
                <div className="text-xs font-bold text-slate-200">Blood Oxygen (SpO2)</div>
                <p className="text-[10px] text-olive-300 mt-1">Normal high-altitude saturation</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-olive-950 to-cyan-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300">Approved</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">3 <span className="text-xs font-normal text-olive-400">Days</span></div>
                <div className="text-xs font-bold text-slate-200">Wellness Recharge Respite</div>
                <p className="text-[10px] text-cyan-300 mt-1">Scheduled for next rotation</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-accent-gold/40 bg-olive-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-accent-gold font-mono uppercase">Confidential Screener</div>
                <div className="text-sm font-bold text-white mt-1">PHQ-9 Mental Vitality Check</div>
                <p className="text-[10px] text-olive-300 mt-0.5">100% anonymized voluntary screener</p>
              </div>
              <button
                onClick={() => onNavigate('assessment')}
                className="w-full py-2 rounded-xl bg-accent-gold text-navy-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Start Screener</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 🟡 TIER 2: COMMANDING OFFICER (CO) WIDGETS */}
        {currentRole === 'commander' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-accent-gold/40 bg-gradient-to-br from-olive-950 to-amber-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-olive-900 text-accent-gold border border-olive-700">
                  142 BN HQ
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-accent-gold font-mono">88.4 <span className="text-xs font-normal text-olive-400">%</span></div>
                <div className="text-xs font-bold text-white">Battalion Operational Readiness</div>
                <p className="text-[10px] text-emerald-300 mt-1">Optimal readiness across 6 sectors</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-rose-500/40 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-rose-300">Siachen / Leh</span>
              </div>
              <div>
                <div className="text-2xl font-black text-rose-400 font-mono">4 <span className="text-xs font-normal text-olive-400">Nodes</span></div>
                <div className="text-xs font-bold text-white">High-Altitude Hypoxia Strain</div>
                <p className="text-[10px] text-rose-300 mt-1">48h rotation respite suggested</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-olive-700 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300">Action Required</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">3 <span className="text-xs font-normal text-olive-400">Pending</span></div>
                <div className="text-xs font-bold text-white">Rest Rotation Authorizations</div>
                <p className="text-[10px] text-olive-300 mt-1">Awaiting commander digital signature</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-accent-gold/40 bg-olive-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-accent-gold font-mono uppercase">14-Day Prediction</div>
                <div className="text-sm font-bold text-white mt-1">Predictive Analytics Suite</div>
                <p className="text-[10px] text-olive-300 mt-0.5">36-factor predictive fatigue model</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="w-full py-2 rounded-xl bg-accent-gold text-navy-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Inspect Forecast</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 🔵 TIER 3: MEDICAL & WELFARE OFFICER WIDGETS */}
        {currentRole === 'welfare_officer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-olive-950 to-rose-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700">
                  TRIAGE ALERT
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-rose-400 font-mono">2 <span className="text-xs font-normal text-olive-400">Cases</span></div>
                <div className="text-xs font-bold text-white">Acute Shift Fatigue Alerts</div>
                <p className="text-[10px] text-rose-300 mt-1">Consecutive night deployment flag</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-emerald-300">Clinical Data</span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400 font-mono">78.2 <span className="text-xs font-normal text-olive-400">%</span></div>
                <div className="text-xs font-bold text-white">Parasympathetic Recovery Avg</div>
                <p className="text-[10px] text-emerald-300 mt-1">Doctor-patient privileged view</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/40 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300">Bio-Patches</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">21 / 21</div>
                <div className="text-xs font-bold text-white">Smart Telemetry Integrity</div>
                <p className="text-[10px] text-cyan-300 mt-1">Continuous signal sync confirmed</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-rose-300 font-mono uppercase">Prescriptions</div>
                <div className="text-sm font-bold text-white mt-1">Issue 48h Hypoxia Respite</div>
                <p className="text-[10px] text-olive-300 mt-0.5">Clinical rest directives</p>
              </div>
              <button
                onClick={() => onNavigate('interventions')}
                className="w-full py-2 rounded-xl bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Open Rx Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 🟣 TIER 4: BEHAVIORAL DATA SCIENTIST WIDGETS */}
        {currentRole === 'analyst' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-olive-950 to-cyan-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  36 TREES
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-cyan-400 font-mono">0.946 <span className="text-xs font-normal text-olive-400">AUC</span></div>
                <div className="text-xs font-bold text-white">Predictive Model ROC-AUC</div>
                <p className="text-[10px] text-cyan-300 mt-1">14-day multi-variate horizon</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-emerald-300">Diff. Privacy</span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400 font-mono">ε = 0.85</div>
                <div className="text-xs font-bold text-white">Differential Privacy Budget</div>
                <p className="text-[10px] text-emerald-300 mt-1">Laplacian noise mechanism active</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-olive-700 bg-olive-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-accent-gold">Security Verified</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">12 / 12</div>
                <div className="text-xs font-bold text-white">12 / 12 Secure Modules</div>
                <p className="text-[10px] text-olive-300 mt-1">Security protocols verified</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-cyan-300 font-mono uppercase">Simulation</div>
                <div className="text-sm font-bold text-white mt-1">Roster What-If Engine</div>
                <p className="text-[10px] text-olive-300 mt-0.5">Simulate duty shift variations</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="w-full py-2 rounded-xl bg-cyan-500 text-navy-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Launch Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Role-Specific Operational Mandate & Duty Directives ─────── */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-olive-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40 uppercase">
                Active Clearance Mandate • {currentRole.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Operational Scope & Clearance Directives
            </h2>
            <p className="text-xs text-olive-300 mt-0.5">
              Strictly isolated under the Armed Forces Welfare Doctrine (§ 108.4 Privacy Charter).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-olive-900 border border-olive-700 text-xs text-accent-gold font-mono font-bold">
              ID: {currentUser.serviceNumber}
            </span>
          </div>
        </div>

        {/* Role-Specific Formal Directive Cards */}
        {currentRole === 'commander' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-accent-gold/40 space-y-2">
              <div className="text-xs font-bold text-accent-gold font-mono uppercase">Readiness Authorization</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Review macro fatigue heatmaps and authorize 48-hour base camp rest rotations across deployed battalion sectors.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-olive-700 space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase">14-Day Predictive Curve</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Evaluate predictive fatigue trajectories to adjust patrol roster schedules before mission saturation.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase">Welfare Doctrine Compliance</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                All individual names are masked under k-anonymity to ensure zero evaluation or disciplinary bias.
              </p>
            </div>
          </div>
        )}

        {currentRole === 'welfare_officer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-rose-500/40 space-y-2">
              <div className="text-xs font-bold text-rose-400 font-mono uppercase">Clinical Triage Directives</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Prescribe 48-hour hypoxia recovery respites and schedule structured psychological defusing debriefs.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-olive-700 space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase">Doctor-Patient Privilege</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Access privileged biometric waveforms (PPG, SpO2, HRV) strictly for medical recovery management.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase">Medical Protocol SOP</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Track nocturnal desaturation clusters in Leh and Siachen outposts for early AMS prevention.
              </p>
            </div>
          </div>
        )}

        {currentRole === 'personnel' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase">Personal Biometric Sovereignty</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Your live smartwatch telemetry (HRV, SpO2, sleep recovery) is private to you and your Medical Officer.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-olive-700 space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase">Confidential PHQ-9 Screener</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Take voluntary mental stamina assessments without fear of stigma or appraisal impact.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-accent-gold/40 space-y-2">
              <div className="text-xs font-bold text-accent-gold font-mono uppercase">3-Day Wellness Leave</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Submit confidential wellness recharge requests directly to your unit welfare desk.
              </p>
            </div>
          </div>
        )}

        {currentRole === 'analyst' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-cyan-500/40 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono uppercase">Differential Privacy Pipeline</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Manage Laplacian noise parameters (ε = 0.85) and export anonymized wellness datasets.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-olive-700 space-y-2">
              <div className="text-xs font-bold text-white font-mono uppercase">Multivariate Predictive Engine</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Validate 36-factor predictive model accuracy (ROC-AUC 0.946) across 12 physiological and operational features.
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase">Security Policy Audit</div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Verify multi-table security policies and data encryption across CAPF grids.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Strategic Problem Statement vs Solution Cards ────────────────── */}
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

      {/* ── 5. Key Highlights Section ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Core Architecture Highlights
            </h2>
            <p className="text-xs text-olive-300">Key pillars built for Central Armed Police Forces</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate(currentRole === 'commander' ? 'commander-dashboard' : currentRole === 'analyst' ? 'algorithm-telemetry' : currentRole === 'welfare_officer' ? 'clinical-dashboard' : 'dashboard')}
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
              <span>View Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate(currentRole === 'welfare_officer' ? 'clinical-dashboard' : 'privacy')}
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

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate(currentRole === 'analyst' ? 'datasets' : currentRole === 'personnel' ? 'voice-assistant' : 'integrations')}
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
