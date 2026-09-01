import React, { useState } from 'react';
import { Wordmark } from '../common/Wordmark';
import { useAuth } from '../../context/AuthContext';
import { getVisibleTabsForRole, NavCategory } from '../../config/navConfig';
import {
  ShieldCheck,
  PhoneCall,
  Lock,
  HeartHandshake,
  Award,
  ExternalLink,
  Radio,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const visibleTabs = getVisibleTabsForRole(role);
  const footerCategories: NavCategory[] = ['Core Modules', 'Analytics & Welfare', 'Platform & Demo'];

  return (
    <footer className="w-full border-t border-olive-400/25 bg-gradient-to-b from-olive-950/95 via-navy-950 to-navy-950 text-slate-200 relative z-20 overflow-hidden">
      {/* Subtle Tactical Grid in Footer Background */}
      <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-accent-gold/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Emergency Crisis Helpline Top Alert Bar */}
      <div className="border-b border-olive-800/80 bg-olive-900/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-accent-gold font-bold">
            <PhoneCall className="w-4 h-4 text-accent-gold animate-bounce" />
            <span>24x7 Armed Forces & CAPF Mental Health Support:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-mono bg-olive-950/80 px-2.5 py-1 rounded-lg border border-olive-700">
              <span className="text-olive-300">Tele-MANAS:</span>
              <a href="tel:14416" className="text-white font-bold hover:text-accent-gold transition-colors">
                14416 / 1800 891 4416
              </a>
            </div>

            <div className="flex items-center gap-1.5 font-mono bg-olive-950/80 px-2.5 py-1 rounded-lg border border-olive-700">
              <span className="text-olive-300">CRPF Sathi Helpline:</span>
              <span className="text-white font-bold">1800 115 125</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-600/40 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Confidential & Anonymous</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand, Mission & Logo (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Wordmark size="lg" showSubtitle={false} />

            <p className="text-xs text-olive-200/90 leading-relaxed max-w-sm">
              AI-Based Predictive Personnel Stress and Welfare Monitoring System developed for the Ministry of Home Affairs, Central Reserve Police Force (CRPF), and Central Armed Police Forces (CAPFs).
            </p>

            {/* Welfare Doctrine Seal */}
            <div className="p-3 rounded-2xl bg-olive-900/50 border border-accent-gold/30 flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-accent-gold/15 text-accent-gold shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-accent-gold uppercase tracking-wider font-mono">
                  Welfare Doctrine Protected
                </div>
                <div className="text-[10px] text-olive-200 leading-tight">
                  Strictly designated for proactive health and rest rotations. Psychological telemetry is barred from disciplinary appraisal.
                </div>
              </div>
            </div>
          </div>

          {/* Role-scoped navigation: no links for modules outside this account's post. */}
          {footerCategories.map((category) => {
            const tabs = visibleTabs.filter((tab) => tab.category === category);
            if (tabs.length === 0) return null;

            return (
              <div key={category} className="lg:col-span-2 space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-gold">
                  {category}
                </div>
                <ul className="space-y-2 text-xs">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => onNavigate(tab.id)}
                        className="text-olive-200 hover:text-white transition-colors text-left flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-olive-400" />
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Col 4: Security & Forces Grid (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-gold">
              Security & Defense Grid
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-olive-300 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256-GCM + TLS 1.3 mTLS</span>
              </div>
              <div className="flex items-center gap-2 text-olive-300 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Trust Role-Based Access</span>
              </div>
              <div className="flex items-center gap-2 text-olive-300 font-mono text-[11px]">
                <Radio className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
                <span>Encrypted Edge Ingestion Node</span>
              </div>
            </div>

            {/* Forces Badges */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-olive-400 uppercase tracking-wider mb-1.5">
                Supported Forces
              </div>
              <div className="flex flex-wrap gap-1.5 text-[9px] font-mono font-bold text-olive-100">
                {['CRPF', 'BSF', 'ITBP', 'CISF', 'SSB', 'Assam Rifles', 'NSG'].map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded-md bg-olive-900/80 border border-olive-600/40"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="mt-10 pt-6 border-t border-olive-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-olive-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              वीरWell (VeerWell 2.0) • AI-Based Personnel Stress & Welfare Platform • Built for Ministry of Home Affairs / CAPF
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>MedTech • BioTech • HealthTech Theme</span>
            <span>•</span>
            <span className="font-mono text-accent-gold font-bold">Rakshak AI v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
