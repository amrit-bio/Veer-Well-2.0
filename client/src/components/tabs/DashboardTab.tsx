import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StressOrb3D } from '../3d/StressOrb3D';
import { DashboardStats } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Heart,
  AlertTriangle,
  FileCheck2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Animated Count-Up Number Component via Framer Motion
const CountUp: React.FC<{ value: number; suffix?: string; prefix?: string; decimals?: number }> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
};

export const DashboardTab: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { user, role, isAnonymized } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const radarData = stats?.departmentAverages.map((dept) => ({
    department: dept.department,
    wellness: dept.wellnessScore,
    stress: dept.stressScore * 10,
    resilience: 100 - dept.overtimeRate,
  })) || [
    { department: 'Operations', wellness: 74, stress: 62, resilience: 66 },
    { department: 'Healthcare & Field', wellness: 81, stress: 54, resilience: 72 },
    { department: 'Engineering & IT', wellness: 86, stress: 41, resilience: 82 },
    { department: 'Administration', wellness: 89, stress: 38, resilience: 88 },
  ];

  const barData = stats?.departmentAverages.map((dept) => ({
    name: dept.department.split(' ')[0],
    Wellness: dept.wellnessScore,
    StressIndex: dept.stressScore * 10,
    Overtime: dept.overtimeRate,
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-emerald-500/20 glow-emerald">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Readiness Feed
            </span>
            <span className="text-xs text-slate-400 font-mono">Synced: Today 20:20 IST</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {role === 'employee' ? user?.name : isAnonymized ? `${user?.anonymizedId} (Director)` : user?.name}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time workforce stress telemetry, predictive burnout detection, and biometrics across {stats?.totalEmployees || 21} active personnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('assessments')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Mood Check</span>
          </button>
          <button
            onClick={() => onNavigate('stress')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Ingest Stress PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid with Framer Motion Count-Up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Org Wellness Index */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Org Wellness Score
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            <CountUp value={stats?.orgWellnessIndex || 82} suffix="/100" />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.4% from last audit</span>
          </div>
        </motion.div>

        {/* Card 2: Average Stress Score */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Stress Index
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            <CountUp value={stats?.avgStressIndex || 4.8} decimals={1} suffix="/10" />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
            <span className="font-semibold">Moderate Intensity Zone</span>
          </div>
        </motion.div>

        {/* Card 3: Burnout Risk Flags */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Burnout Risk Flags
            </span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            <CountUp value={stats?.burnoutRiskCount || 4} suffix=" Personnel" />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-rose-400">
            <span>High fatigue / night-shift load</span>
          </div>
        </motion.div>

        {/* Card 4: Assessment Completion */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Check-Ins
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            <CountUp value={stats?.pendingAssessmentsCount || 1} suffix=" Due" />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-cyan-400">
            <span>94.8% participation achieved</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: 3D Visual Centerpiece & Department Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 3D Centerpiece Orb (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-panel p-6 rounded-3xl border border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                3D Aggregate Stress & Resonance Orb
              </h2>
              <p className="text-xs text-slate-400">
                Orb physical turbulence, surface deformation and color matrix react directly to aggregate workforce stress.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Stress: {stats?.avgStressIndex || 4.8}/10
              </span>
            </div>
          </div>

          {/* React Three Fiber 3D Canvas */}
          <div className="my-2">
            <StressOrb3D
              stressScore={stats?.avgStressIndex || 4.8}
              wellnessScore={stats?.orgWellnessIndex || 82}
              className="h-72 md:h-80"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Cognitive Load</span>
              <strong className="text-xs text-emerald-400">Optimal (34%)</strong>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Field Fatigue</span>
              <strong className="text-xs text-amber-400">Moderate (58%)</strong>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Circadian Health</span>
              <strong className="text-xs text-cyan-400">Stable (84%)</strong>
            </div>
          </div>
        </div>

        {/* Right Department Health Radar & Breakdown (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Department Wellness Radar</h2>
            <span className="text-xs font-mono text-slate-400">Multi-Vector</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="department" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                <Radar name="Wellness Index" dataKey="wellness" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="Stress Index" dataKey="stress" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
            {stats?.departmentAverages.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{dept.department}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-emerald-400">{dept.wellnessScore} W-Score</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-400">{dept.stressScore} Stress</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Actionable Alerts & Department Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Workforce Telemetry Alerts</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Live Active</span>
          </div>

          <div className="space-y-3">
            {stats?.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  alert.type === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : alert.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    {alert.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{alert.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-400">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department Bar Overview */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Department Wellness vs Stress Index</h3>
            <span className="text-[11px] font-mono text-slate-400">Normalized Scale</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Wellness" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="StressIndex" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
