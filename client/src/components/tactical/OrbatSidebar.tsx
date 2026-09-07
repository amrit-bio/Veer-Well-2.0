/**
 * वीरWell (Rakshak AI) — ORBAT Sidebar
 * 
 * Left-hand Order of Battle (ORBAT) Sidebar listing squads
 * with micro-sparklines for readiness visualization.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crosshair, Shield, Zap, Radio, Target, AlertTriangle,
  ChevronRight, Activity,
} from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import type { SquadState } from '../../lib/tactical/nsgStateMachine';

// ─── Props ───────────────────────────────────────────────────────────────────

interface OrbatSidebarProps {
  squads: SquadState[];
  selectedSquadId: string | null;
  onSelectSquad: (squadId: string) => void;
  onDragStart: (squad: SquadState) => void;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const DEPLOYMENT_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  CT: { icon: <Crosshair className="w-4 h-4" />, color: 'text-rose-400' },
  VIP: { icon: <Shield className="w-4 h-4" />, color: 'text-blue-400' },
  BOMB_DISPOSAL: { icon: <Zap className="w-4 h-4" />, color: 'text-amber-400' },
  HOSTAGE_RESCUE: { icon: <Target className="w-4 h-4" />, color: 'text-violet-400' },
  RECON: { icon: <Radio className="w-4 h-4" />, color: 'text-cyan-400' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  STANDBY: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  DEPLOYED: { color: 'text-rose-400', bg: 'bg-rose-500/20' },
  RECOVERY: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  DEBRIEF: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  MAINTENANCE: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

// ─── Micro Sparkline ─────────────────────────────────────────────────────────

const MicroSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const OrbatSidebar: React.FC<OrbatSidebarProps> = ({
  squads,
  selectedSquadId,
  onSelectSquad,
  onDragStart,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredSquads = filter === 'ALL'
    ? squads
    : squads.filter((s) => s.status === filter);

  const statusCounts = {
    ALL: squads.length,
    STANDBY: squads.filter((s) => s.status === 'STANDBY').length,
    DEPLOYED: squads.filter((s) => s.status === 'DEPLOYED').length,
    RECOVERY: squads.filter((s) => s.status === 'RECOVERY').length,
    DEBRIEF: squads.filter((s) => s.status === 'DEBRIEF').length,
    MAINTENANCE: squads.filter((s) => s.status === 'MAINTENANCE').length,
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-navy-900 border border-olive-700/60 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-olive-700/60">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white tracking-tight uppercase">
              Order of Battle
            </h3>
            <p className="text-[10px] text-olive-500 font-mono">
              {squads.length} Squads • {squads.reduce((sum, s) => sum + s.personnelCount, 0)} Personnel
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[9px] font-mono font-bold transition-all ${
                filter === status
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-olive-950 text-olive-500 border border-olive-700/40 hover:border-olive-600'
              }`}
            >
              {status === 'ALL' ? 'ALL' : status.slice(0, 3)}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Squad List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSquads.map((squad, idx) => {
          const config = DEPLOYMENT_CONFIG[squad.deploymentType] || DEPLOYMENT_CONFIG.CT;
          const statusConf = STATUS_CONFIG[squad.status] || STATUS_CONFIG.STANDBY;
          const isSelected = squad.squadId === selectedSquadId;
          const isDeployed = squad.status === 'DEPLOYED';
          const isRecovery = squad.status === 'RECOVERY';

          // Mock readiness sparkline data
          const sparklineData = Array.from({ length: 8 }, (_, i) => ({
            v: squad.readinessScore + (Math.random() - 0.5) * 10,
          }));

          return (
            <motion.div
              key={squad.squadId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              draggable
              onDragStart={() => onDragStart(squad)}
              onClick={() => onSelectSquad(squad.squadId)}
              className={`group p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : isDeployed
                  ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                  : isRecovery
                  ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                  : 'bg-olive-950 border-olive-700/40 hover:border-olive-600'
              }`}
            >
              {/* Squad Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${config.color.replace('text-', 'bg-').replace('400', '500/20').replace('text-', 'border-')}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{squad.codename}</p>
                    <p className="text-[9px] text-olive-500 font-mono">
                      {squad.deploymentType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusConf.bg} ${statusConf.color} border-current`}>
                  {squad.status}
                </span>
              </div>

              {/* Readiness Sparkline */}
              <div className="mb-2">
                <MicroSparkline
                  data={sparklineData.map((d) => d.v)}
                  color={
                    squad.readinessScore >= 80 ? '#10b981' :
                    squad.readinessScore >= 60 ? '#f59e0b' : '#ef4444'
                  }
                />
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[9px] text-olive-500 font-mono">READY</p>
                  <p className={`text-xs font-black font-mono ${
                    squad.readinessScore >= 80 ? 'text-emerald-400' :
                    squad.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {squad.readinessScore}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-olive-500 font-mono">OPS</p>
                  <p className={`text-xs font-black font-mono ${
                    squad.opsTempo > 90 ? 'text-rose-400' :
                    squad.opsTempo > 75 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {squad.opsTempo}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-olive-500 font-mono">PERS</p>
                  <p className="text-xs font-black font-mono text-white">
                    {squad.personnelCount}
                  </p>
                </div>
              </div>

              {/* Drag Handle Indicator */}
              <div className="mt-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-3 h-3 text-olive-500" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
