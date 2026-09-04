import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export const DeploymentLogisticsTab: React.FC = () => {
  const posts = [
    { id: 1, name: 'Post Alpha - Forward Zone', unit: '209 CoBRA Bn', readiness: 87, fatigue: 34, altitude: true, status: 'Operational' },
    { id: 2, name: 'Post Beta - Border Sector', unit: '142 Bn', readiness: 64, fatigue: 58, altitude: true, status: 'Rest Recommended' },
    { id: 3, name: 'Post Gamma - Base Camp', unit: '101 Bn', readiness: 92, fatigue: 21, altitude: false, status: 'Operational' },
    { id: 4, name: 'Post Delta - Siachen Link', unit: 'SSB', readiness: 45, fatigue: 72, altitude: true, status: 'Critical - Evacuation Advisory' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-accent-gold/20 to-accent-saffron/20 border border-accent-gold/40 shadow-lg">
          <MapPin className="w-6 h-6 text-accent-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Deployment Logistics</h2>
          <p className="text-xs text-olive-300 font-mono">Post locations mapped against unit readiness & fatigue scores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-olive-900/50 border border-olive-700/50">
          <div className="text-xs text-olive-400 font-mono mb-1">TOTAL POSTS</div>
          <div className="text-2xl font-black text-white">4</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-mono mb-1">OPERATIONAL</div>
          <div className="text-2xl font-black text-white">2</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <div className="text-xs text-amber-400 font-mono mb-1">REST ADVISED</div>
          <div className="text-2xl font-black text-white">1</div>
        </div>
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
          <div className="text-xs text-rose-400 font-mono mb-1">CRITICAL</div>
          <div className="text-2xl font-black text-white">1</div>
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-accent-gold" />
            Post Status Overview
          </h3>
        </div>
        <div className="divide-y divide-olive-800">
          {posts.map((post) => (
            <div key={post.id} className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${post.altitude ? 'text-cyan-400' : 'text-olive-400'}`} />
                  <div>
                    <div className="text-sm font-bold text-white">{post.name}</div>
                    <div className="text-[10px] text-olive-400 font-mono">{post.unit}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  post.status.includes('Critical') ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                  post.status.includes('Rest') ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>{post.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-2 rounded-xl bg-olive-900/50 border border-olive-800">
                  <div className="text-[10px] text-olive-400 font-mono">READINESS</div>
                  <div className={`text-lg font-black ${post.readiness >= 80 ? 'text-emerald-400' : post.readiness >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {post.readiness}%
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-olive-900/50 border border-olive-800">
                  <div className="text-[10px] text-olive-400 font-mono">FATIGUE INDEX</div>
                  <div className={`text-lg font-black ${post.fatigue <= 40 ? 'text-emerald-400' : post.fatigue <= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {post.fatigue}%
                  </div>
                </div>
              </div>
              {post.altitude && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                  <AlertTriangle className="w-3 h-3" />
                  <span>High Altitude Zone • Hypoxia Risk Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
