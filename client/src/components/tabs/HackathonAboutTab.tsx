import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import {
  Info,
  Users,
  GitBranch,
  Smartphone,
  Radio,
  Cpu,
  Globe,
  Sparkles,
  Award,
  CheckCircle2,
  Rocket,
} from 'lucide-react';

export const HackathonAboutTab: React.FC = () => {
  const teamMembers = [
    {
      name: 'Amritanshu & Team',
      role: 'Lead Systems Architect & Full-Stack AI Engineer',
      focus: 'Tactical UI/UX, 3D Shaders, Predictive Analytics & Security Architecture',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'RakshaTech Defense AI Lab',
      role: 'Occupational Health & Biometric Data Specialist',
      focus: 'HRV Telemetry Modeling, CAPF Welfare Doctrine, K-Anonymity Protocols',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const roadmap = [
    {
      phase: 'Phase 1 (Current Hackathon MVP)',
      status: 'Live & Operational',
      badge: 'Completed',
      items: [
        'React 18 + TypeScript + Three.js 3D Stress & Resonance Visualizers',
        'Framer Motion multi-step psychological assessment questionnaire',
        'Automated Welfare Officer intervention recommendations & counseling prompts',
        'PDF, CSV, and synthetic dataset ingestion pipeline with differential privacy',
      ],
    },
    {
      phase: 'Phase 2 (Mobile & Offline Edge App)',
      status: 'Q4 2026',
      badge: 'In Development',
      items: [
        'Native Flutter/React Native mobile application for Jawans & officers',
        'Direct Bluetooth Low Energy (BLE) sync with tactical smartwatches & chest straps',
        'Local on-device SQLite biometric cache with biometric fingerprint lock',
      ],
    },
    {
      phase: 'Phase 3 (Tactical Mesh Network Node)',
      status: 'Q1 2027',
      badge: 'Planned',
      items: [
        'LoRa / Tactical VHF encrypted mesh data transfer for zero-connectivity border posts',
        'Siachen / Ladakh forward outpost edge synchronization without internet access',
        'Automated distress beacon for acute mountain sickness & extreme hypoxia',
      ],
    },
    {
      phase: 'Phase 4 (Deep Multi-Modal Voice & Thermal AI)',
      status: 'Q3 2027',
      badge: 'R&D Concept',
      items: [
        'Acoustic micro-tremor voice stress analysis during routine radio check-ins',
        'Contactless thermal camera night-duty circadian sleep monitoring',
      ],
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
              National Security & Defense Hackathon
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            About VeerWell & Strategic Roadmap
          </h1>
          <p className="text-xs md:text-sm text-olive-200 mt-1 max-w-2xl">
            Engineered to demonstrate the future of armed forces wellness technology. Designed for deployment on modern cloud edge infrastructure.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-olive-900 border border-olive-400/40 text-xs font-mono text-white">
          <Globe className="w-4 h-4 text-accent-gold" />
          <span>Vercel / Cloud Ready</span>
        </div>
      </div>

      {/* Team Details */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Users className="w-5 h-5 text-accent-gold" />
          <h2>Project Engineering Team: Team VeerWell</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((m, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-olive-900/60 border border-olive-700/60 flex items-start gap-3.5"
            >
              <img
                src={m.avatar}
                alt={m.name}
                className="w-12 h-12 rounded-xl object-cover border border-accent-gold/40 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{m.name}</h3>
                <div className="text-xs text-accent-gold font-mono font-semibold truncate">{m.role}</div>
                <p className="text-[11px] text-olive-300 leading-relaxed">{m.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Roadmap */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-accent-gold" />
            Future Development & Tactical Scaling Roadmap
          </h2>
          <p className="text-xs text-olive-300 mt-0.5">
            Phased deployment timeline for border deployments and mobile native platforms.
          </p>
        </div>

        <div className="space-y-4">
          {roadmap.map((rm, idx) => (
            <div
              key={idx}
              className="p-4 md:p-5 rounded-2xl bg-olive-900/50 border border-olive-700/50 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-gold" />
                  <h3 className="text-sm font-bold text-white">{rm.phase}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-olive-300">{rm.status}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rm.badge === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : rm.badge === 'In Development'
                        ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                        : 'bg-olive-800 text-slate-300 border border-olive-700'
                    }`}
                  >
                    {rm.badge}
                  </span>
                </div>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-olive-200 pt-1">
                {rm.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
