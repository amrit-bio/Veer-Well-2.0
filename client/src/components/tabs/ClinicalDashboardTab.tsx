import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertTriangle, CheckCircle2, Clock, UserCheck } from 'lucide-react';

export const ClinicalDashboardTab: React.FC = () => {
  const highRiskProfiles = [
    { id: 1, name: 'Personnel A', unit: '209 CoBRA Bn', risk: 'Critical', score: 89, condition: 'Acute Hypoxia + Sleep Deprivation' },
    { id: 2, name: 'Personnel B', unit: '142 Bn', risk: 'High', score: 76, condition: 'Burnout Risk - 3 consecutive night shifts' },
    { id: 3, name: 'Personnel C', unit: '101 Bn', risk: 'High', score: 71, condition: 'PHQ-9 Score Elevated + HRV Drop' },
  ];

  const interventions = [
    { id: 1, title: '48h Base Camp Thermal Respite', target: 'Personnel A', status: 'Pending', urgency: 'Immediate' },
    { id: 2, title: 'Psychological Debriefing', target: 'Personnel B', status: 'Scheduled', urgency: 'Scheduled' },
    { id: 3, title: 'Clinical Counseling Session', target: 'Personnel C', status: 'Active', urgency: 'Preventative' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-900 to-rose-950 border border-rose-500/40 shadow-lg">
          <Stethoscope className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Clinical Dashboard</h2>
          <p className="text-xs text-olive-300 font-mono">De-anonymized intervention recommendations & high-risk profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-300">CRITICAL ALERTS</span>
          </div>
          <div className="text-3xl font-black text-white">3</div>
          <div className="text-[10px] text-olive-400 font-mono">Require immediate clinical attention</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">PENDING REVIEW</span>
          </div>
          <div className="text-3xl font-black text-white">7</div>
          <div className="text-[10px] text-olive-400 font-mono">Awaiting medical officer action</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">RESOLVED THIS WEEK</span>
          </div>
          <div className="text-3xl font-black text-white">12</div>
          <div className="text-[10px] text-olive-400 font-mono">Successful interventions completed</div>
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-accent-gold" />
            High-Risk Profiles Requiring Clinical Attention
          </h3>
        </div>
        <div className="divide-y divide-olive-800">
          {highRiskProfiles.map((profile) => (
            <div key={profile.id} className="px-4 py-3 flex items-center justify-between hover:bg-olive-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  profile.risk === 'Critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <div>
                  <div className="text-sm font-bold text-white">{profile.name}</div>
                  <div className="text-[10px] text-olive-400 font-mono">{profile.unit} • Score: {profile.score}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${
                  profile.risk === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                }`}>{profile.risk}</div>
                <div className="text-[10px] text-olive-400 max-w-[200px] truncate">{profile.condition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
          <h3 className="text-sm font-bold text-white">Intervention Pipeline</h3>
        </div>
        <div className="divide-y divide-olive-800">
          {interventions.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-[10px] text-olive-400 font-mono">Target: {item.target}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  item.urgency === 'Immediate' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                  item.urgency === 'Scheduled' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>{item.urgency}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  item.status === 'Pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                  item.status === 'Active' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                  'bg-olive-500/20 border-olive-500/40 text-olive-300'
                }`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
