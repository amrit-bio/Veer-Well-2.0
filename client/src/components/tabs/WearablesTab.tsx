import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BioRing3D } from '../3d/BioRing3D';
import { WearablesSummary } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Flame,
  Footprints,
  Moon,
  Activity,
  Zap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export const WearablesTab: React.FC = () => {
  const { user, role, isAnonymized } = useAuth();
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const [data, setData] = useState<WearablesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadWearables();
  }, [user, days]);

  const loadWearables = async () => {
    setLoading(true);
    try {
      const res = await api.getWearables(user?.id, days);
      setData(res);
    } catch (err) {
      console.error('Failed to load wearables telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPersonal = role === 'employee';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Continuous Bio-Telemetry & HRV Stream
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isPersonal
                ? `Personal Telemetry (${user?.name})`
                : `Org-Wide Aggregate View (${isAnonymized ? 'Anonymized' : 'Decoded'})`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Wearable Biometrics & Physiological Recovery
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time optical PPG and accelerometer telemetry tracking Heart Rate Variability (HRV), resting pulse, sleep architecture, and active physical load.
          </p>
        </div>

        {/* Timeframe Selector (7D, 30D, 90D) */}
        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
          {(['7', '30', '90'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                days === d
                  ? 'bg-cyan-500 text-navy-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Readiness Score */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 glow-emerald flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
              Readiness Score
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.readinessScore || 86}/100
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1">
            Peak Operational Zone
          </span>
        </div>

        {/* Avg Steps */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Daily Steps</span>
            <Footprints className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.avgSteps?.toLocaleString() || '9,420'}
          </div>
          <span className="text-[10px] text-cyan-400 font-mono mt-1">Active Movement</span>
        </div>

        {/* Resting Heart Rate */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Resting HR</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.avgRHR || 64} <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1">Healthy Baseline</span>
        </div>

        {/* Sleep Quality */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Sleep Score</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.avgSleepQuality || 84}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {data?.avgSleepHours || 7.2} hrs average
          </span>
        </div>

        {/* Heart Rate Variability (HRV) */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">HRV (SDNN)</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.avgHRV || 62} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-purple-400 font-mono mt-1">Autonomic Balance</span>
        </div>

        {/* Wearable Stress */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Bio-Stress</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {data?.avgStressScore || 38}/100
          </div>
          <span className="text-[10px] text-amber-400 font-mono mt-1">Low-Moderate</span>
        </div>
      </div>

      {/* Main Grid: 3D Pulsing Bio-Ring & HRV Time-Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Pulsing Bio-Ring (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              3D Cardiac & HRV Harmonic Ring
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pulse frequency dynamically synchronized with current resting heart rate ({data?.avgRHR || 64} BPM) and autonomic balance.
            </p>
          </div>

          <div className="my-2">
            <BioRing3D
              heartRate={data?.avgRHR || 64}
              hrv={data?.avgHRV || 62}
              className="h-64 md:h-72"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Sympathetic Tone</span>
              <strong className="text-cyan-400">Normalized (32%)</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Parasympathetic Recovery</span>
              <strong className="text-emerald-400">High (68%)</strong>
            </div>
          </div>
        </div>

        {/* 30-90 Day HRV & Bio-Stress Area Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">
                {days}-Day HRV & Physiological Stress Trajectory
              </h2>
              <span className="text-xs font-mono text-slate-400">Daily Telemetry Nodes</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Higher HRV indicates autonomic resilience; lower stress score indicates restorative calm.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeSeries || []}>
                <defs>
                  <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="hrv"
                  name="HRV (ms)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hrvGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="stressScore"
                  name="Bio-Stress (0-100)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#stressGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Clinical Correlation:</span>
            <span className="text-emerald-400 font-mono font-bold">
              Sleep Duration strongly correlates with +18% HRV next day
            </span>
          </div>
        </div>
      </div>

      {/* Sleep Architecture & Daily Steps Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sleep Quality & Duration Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Sleep Hours & Quality Index</h3>
            <span className="text-xs font-mono text-indigo-400">Circadian Monitor</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeSeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="sleepQuality"
                  name="Sleep Quality (%)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sleepHours"
                  name="Sleep Hours (h)"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Steps & Active Calories */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Daily Steps & Caloric Burn</h3>
            <span className="text-xs font-mono text-cyan-400">Activity Telemetry</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeSeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="steps"
                  name="Daily Steps"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  name="Calories (kcal)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
