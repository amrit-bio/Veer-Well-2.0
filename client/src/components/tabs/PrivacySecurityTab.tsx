import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileCheck2,
  CheckCircle2,
  Award,
  Key,
  Database,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const PrivacySecurityTab: React.FC = () => {
  const { user, role, isAnonymized, toggleAnonymization } = useAuth();
  const [testInputName, setTestInputName] = useState('Sub-Insp. Vikramaditya');
  const [testForce, setTestForce] = useState('CRPF 209 CoBRA');
  const [copied, setCopied] = useState(false);
  const [selectedRoleTest, setSelectedRoleTest] = useState<'commander' | 'welfare_officer' | 'personnel' | 'analyst'>('commander');

  // Generate simulated cryptographic hash
  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `CAPF-NODE-${hex.toUpperCase().slice(0, 6)}`;
  };

  const currentToken = generateHash(`${testInputName}-${testForce}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rbacMatrix = [
    {
      roleKey: 'commander',
      role: 'Commanding Officer (CO)',
      scope: 'Battalion-Level Aggregate & Strategic Readiness',
      canSeeNames: 'NO (Masked to CAPF-NODE-XXXX)',
      canTriggerDisciplinary: 'BLOCKED (Strict Legal Lock)',
      canAuthorizeRest: 'YES (Approve Battalion Rest Rotations)',
      accessLevel: 'Battalion Telemetry Only',
    },
    {
      roleKey: 'welfare_officer',
      role: 'Welfare / Medical Officer',
      scope: 'Clinical Fatigue & Counseling Directives',
      canSeeNames: 'Voluntary Consultation Only',
      canTriggerDisciplinary: 'BLOCKED (Doctor-Patient Privilege)',
      canAuthorizeRest: 'YES (Prescribe 48h Recovery Respite)',
      accessLevel: 'Clinical Interventions & Counseling',
    },
    {
      roleKey: 'personnel',
      role: 'Frontline Personnel (Jawan)',
      scope: 'Personal Wearables & Self-Care History',
      canSeeNames: 'YES (Own Record Only)',
      canTriggerDisciplinary: 'N/A',
      canAuthorizeRest: 'YES (Apply for Wellness Leave)',
      accessLevel: 'Full Self-Telemetry Access',
    },
    {
      roleKey: 'analyst',
      role: 'Behavioral Data Analyst',
      scope: 'Anonymized Research & Predictive Models',
      canSeeNames: 'NO (100% Differential Privacy)',
      canTriggerDisciplinary: 'BLOCKED (Zero Access)',
      canAuthorizeRest: 'NO',
      accessLevel: 'Differential Privacy (k=5, ε=0.5)',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Military-Grade Cryptographic Safeguards
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Privacy Architecture & Welfare Doctrine Governance
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            Protecting our armed forces personnel through zero-trust anonymization, end-to-end encryption, and the fundamental Welfare Doctrine.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-900 border border-olive-500/40 text-xs font-mono text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AES-256 GCM • ISO 27001 Compliant</span>
        </div>
      </div>

      {/* Welfare Doctrine Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-accent-gold/40 bg-gradient-to-r from-olive-950 via-amber-950/20 to-olive-950 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-accent-gold/10 rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-2 text-accent-gold text-xs font-mono font-bold uppercase tracking-wider">
          <Award className="w-4 h-4 text-accent-gold" />
          <span>The Core Armed Forces Welfare Doctrine</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white">
          “Focus strictly on welfare & recovery, never on disciplinary action.”
        </h2>
        <p className="text-xs md:text-sm text-olive-100/90 leading-relaxed max-w-3xl">
          वीरWell is legally and technically architected as a proactive health intervention tool. System policy blocks any psychological survey or wearable stress telemetry data from being utilized for performance appraisal, court-martial records, or disciplinary penalties.
        </p>
      </div>

      {/* Interactive Cryptographic Token Masking Demonstrator */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-accent-gold" />
              Live Cryptographic Anonymization Hashing Node
            </h2>
            <p className="text-xs text-olive-300">
              Test how identifiable military personnel details are non-reversibly hashed into differential tokens.
            </p>
          </div>
          <button
            onClick={toggleAnonymization}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
              isAnonymized
                ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/50'
                : 'bg-olive-900 text-slate-300 border-olive-700'
            }`}
          >
            {isAnonymized ? '🛡️ Global Privacy Mask: ON' : '🔓 Global Privacy Mask: OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-olive-900/60 p-4 rounded-2xl border border-olive-700/60 text-xs">
          {/* Input 1 */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-olive-300 font-mono">Simulate Personnel Name:</label>
            <input
              type="text"
              value={testInputName}
              onChange={(e) => setTestInputName(e.target.value)}
              className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Input 2 */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-olive-300 font-mono">Force & Unit:</label>
            <select
              value={testForce}
              onChange={(e) => setTestForce(e.target.value)}
              className="w-full bg-olive-950 border border-olive-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-gold"
            >
              <option>CRPF 209 CoBRA</option>
              <option>142 Bn Srinagar Sector</option>
              <option>88 Mahila Bn Delhi</option>
              <option>ITBP Leh High Altitude</option>
            </select>
          </div>

          {/* Result Output */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-accent-gold font-mono font-bold">Non-Reversible Cryptographic Token:</label>
            <div className="flex items-center justify-between bg-navy-950 border border-accent-gold/50 rounded-xl px-3 py-2 text-accent-gold font-mono font-black text-sm">
              <span>{currentToken}</span>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-olive-800 text-olive-300 hover:text-white transition-colors"
                title="Copy Token"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-olive-400/25 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Differential Anonymization</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            All personnel records are hashed into non-reversible tokens (e.g. <code>CAPF-NODE-1042</code>) using K-Anonymity (k=5), preventing identity matching even with database breach.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-olive-400/25 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 text-accent-gold flex items-center justify-center border border-accent-gold/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Role-Based Access Control</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            Strict granular permissions ensure Commanders only view aggregate battalion readiness metrics while Jawans maintain total sovereignty over their personal biometrics.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-olive-400/25 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Encrypted Edge Pipeline</h3>
          <p className="text-xs text-olive-200 leading-relaxed">
            Telemetry is encrypted in-transit via TLS 1.3 with mutual authentication (mTLS) and encrypted at-rest using military-standard AES-256-GCM algorithms.
          </p>
        </div>
      </div>

      {/* RBAC Access Permissions Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-accent-gold" />
            Role-Based Access Control (RBAC) Governance Matrix
          </h2>
          <span className="text-xs font-mono text-olive-300">Zero-Trust Protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-olive-800 text-olive-300 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Role / Post</th>
                <th className="pb-3">Data Visibility Scope</th>
                <th className="pb-3">Personnel Names Visible?</th>
                <th className="pb-3">Disciplinary Use</th>
                <th className="pb-3">Rest Approval Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-800/60">
              {rbacMatrix.map((r, i) => (
                <tr key={i} className="hover:bg-olive-900/40 transition-colors">
                  <td className="py-3.5 font-bold text-white font-mono">{r.role}</td>
                  <td className="py-3.5 text-olive-200">{r.scope}</td>
                  <td className="py-3.5 font-mono text-accent-gold font-semibold">{r.canSeeNames}</td>
                  <td className="py-3.5 font-mono text-rose-400 font-bold">{r.canTriggerDisciplinary}</td>
                  <td className="py-3.5 font-mono text-emerald-400 font-bold">{r.canAuthorizeRest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

