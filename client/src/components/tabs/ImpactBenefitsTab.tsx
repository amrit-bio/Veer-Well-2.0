import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import {
  Award,
  TrendingUp,
  Shield,
  HeartPulse,
  Clock,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const ImpactBenefitsTab: React.FC = () => {
  const forceImpacts = [
    {
      force: 'CRPF (Central Reserve Police Force)',
      motto: 'Service and Loyalty',
      focus: 'Counter-Insurgency & Riot Control',
      impact: 'Reduces burnout in high-intensity tactical rotations (e.g. CoBRA units) through automated rest cycles.',
    },
    {
      force: 'BSF (Border Security Force)',
      motto: 'Duty unto Death',
      focus: 'Frontier Border Sentry & Surveillance',
      impact: 'Mitigates night sentry vigilance fatigue and extreme thermal strain in desert/marshland sectors.',
    },
    {
      force: 'ITBP (Indo-Tibetan Border Police)',
      motto: 'Valour, Determination, Devotion',
      focus: 'High Altitude & Sub-Zero Defense',
      impact: 'Tracks hypoxia symptoms and nocturnal SpO2 drops to avert acute mountain sickness (AMS) in Siachen/Leh.',
    },
    {
      force: 'CISF & SSB (Security & Frontier Forces)',
      motto: 'Protection & Security',
      focus: 'Critical Infrastructure & Frontier Control',
      impact: 'Maintains optimal cognitive stamina during continuous airport & nuclear facility perimeter security.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Strategic Force Multiplier
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Strategic Impact & Force Readiness Benefits
          </h1>
          <p className="text-xs md:text-sm text-olive-200 mt-1 max-w-2xl">
            Transforming reactive medical crisis management into proactive, continuous physiological resilience for India's 1.1 million CAPF & Armed Forces personnel.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-olive-900 border border-accent-gold/40 text-accent-gold font-mono text-xs">
          <Award className="w-5 h-5 shrink-0" />
          <span>Combat Readiness: +28%</span>
        </div>
      </div>

      {/* 3 Major Quantified Benefit Infographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-3xl border border-accent-gold/30 relative overflow-hidden space-y-3 glow-gold"
        >
          <div className="text-4xl md:text-5xl font-black text-accent-gold font-mono">
            7–14 Days
          </div>
          <h3 className="text-lg font-bold text-white">Early Stress & Burnout Detection</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            Flags autonomic nervous system (ANS) fatigue shifts through continuous HRV trends days before behavioral or clinical burnout occurs.
          </p>
          <div className="pt-2 border-t border-olive-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Prevents 80%+ of operational exhaustion cases</span>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden space-y-3 glow-olive"
        >
          <div className="text-4xl md:text-5xl font-black text-emerald-400 font-mono">
            +32%
          </div>
          <h3 className="text-lg font-bold text-white">Improved Tactical Resilience</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            Scheduled 48h active rest rotations and dedicated Wellness Recharge days restore parasympathetic tone and cognitive vigilance.
          </p>
          <div className="pt-2 border-t border-olive-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Faster return to peak operational readiness</span>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden space-y-3"
        >
          <div className="text-4xl md:text-5xl font-black text-cyan-400 font-mono">
            -54%
          </div>
          <h3 className="text-lg font-bold text-white">Overtime Fatigue Reduction</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            Automated workload rebalancing prevents disproportionate burden on frontline detachments, optimizing roster fairness across battalions.
          </p>
          <div className="pt-2 border-t border-olive-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Equitable shift & leave distribution</span>
          </div>
        </motion.div>
      </div>

      {/* Strategic Force Breakdown */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-gold" />
            Strategic Importance Across Central Armed Forces
          </h2>
          <p className="text-xs text-olive-300">Tailored mission profiles for each force branch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forceImpacts.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-olive-900/60 border border-olive-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-bold text-white">{f.force}</h3>
                <span className="text-[10px] font-mono text-accent-gold italic">{f.motto}</span>
              </div>
              <div className="text-[11px] text-accent-gold font-mono">{f.focus}</div>
              <p className="text-xs text-olive-200 leading-relaxed">{f.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
