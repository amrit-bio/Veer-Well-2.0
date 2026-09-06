import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Legend,
} from 'recharts';
import {
  Shield, Activity, TrendingUp, Users, AlertTriangle, CheckCircle2,
  Clock, MapPin, ArrowUpRight, ArrowDownRight, Zap, Globe, ChevronRight,
  BarChart3, PieChart, Eye, EyeOff,
} from 'lucide-react';
import { BrandedLoader } from '../common/BrandedLoader';

interface SectorBattalionSummary {
  battalion: string;
  force: string;
  location: string;
  strength: number;
  avgStress: number;
  fatigueFlags: number;
  readinessScore: number;
  burnoutRisk: number;
  activeCases: number;
  trend: 'up' | 'down' | 'stable';
}

interface SectorTrendPoint {
  date: string;
  sectorAvgStress: number;
  sectorReadiness: number;
  escalatedCases: number;
}

interface CrossUnitComparison {
  unit: string;
  force: string;
  stressIndex: number;
  readinessScore: number;
  fatigueFlags: number;
  interventionLoad: number;
}

interface EscalatedCase {
  id: string;
  battalion: string;
  force: string;
  caseType: string;
  severity: 'critical' | 'high' | 'moderate';
  daysPending: number;
  lastUpdate: string;
  assignedTo: string;
}

const MOCK_SECTOR_BATTALIONS: SectorBattalionSummary[] = [
  { battalion: '142 Bn', force: 'CRPF', location: 'Srinagar Sector', strength: 980, avgStress: 6.8, fatigueFlags: 12, readinessScore: 78, burnoutRisk: 18, activeCases: 3, trend: 'down' },
  { battalion: '85 Bn', force: 'CRPF', location: 'Srinagar Sector', strength: 1020, avgStress: 7.2, fatigueFlags: 19, readinessScore: 71, burnoutRisk: 24, activeCases: 5, trend: 'up' },
  { battalion: '179 Bn', force: 'BSF', location: 'Jammu Sector', strength: 890, avgStress: 5.9, fatigueFlags: 8, readinessScore: 84, burnoutRisk: 12, activeCases: 2, trend: 'stable' },
  { battalion: '41 Bn', force: 'ITBP', location: 'Ladakh Sector', strength: 760, avgStress: 7.8, fatigueFlags: 24, readinessScore: 65, burnoutRisk: 31, activeCases: 7, trend: 'up' },
  { battalion: '138 Bn', force: 'CRPF', location: 'Punjab Sector', strength: 940, avgStress: 5.4, fatigueFlags: 6, readinessScore: 88, burnoutRisk: 9, activeCases: 1, trend: 'down' },
  { battalion: '62 Bn', force: 'BSF', location: 'Rajasthan Sector', strength: 880, avgStress: 6.1, fatigueFlags: 11, readinessScore: 79, burnoutRisk: 15, activeCases: 3, trend: 'stable' },
];

const MOCK_SECTOR_TREND: SectorTrendPoint[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    sectorAvgStress: +(5.5 + Math.random() * 2.5).toFixed(1),
    sectorReadiness: +(70 + Math.random() * 20).toFixed(1),
    escalatedCases: Math.floor(Math.random() * 8),
  };
});

const MOCK_ESCALATED_CASES: EscalatedCase[] = [
  { id: 'ESC-001', battalion: '41 Bn', force: 'ITBP', caseType: 'High Altitude Hypoxia', severity: 'critical', daysPending: 5, lastUpdate: '2h ago', assignedTo: 'DIG Leh Zone' },
  { id: 'ESC-002', battalion: '85 Bn', force: 'CRPF', caseType: 'PHQ-9 > 18', severity: 'critical', daysPending: 3, lastUpdate: '4h ago', assignedTo: 'DIG Srinagar' },
  { id: 'ESC-003', battalion: '41 Bn', force: 'ITBP', caseType: 'SpO₂ Chronic Low', severity: 'high', daysPending: 7, lastUpdate: '1d ago', assignedTo: 'MO 41 Bn' },
  { id: 'ESC-004', battalion: '85 Bn', force: 'CRPF', caseType: 'Sleep Debt > 60h', severity: 'high', daysPending: 4, lastUpdate: '6h ago', assignedTo: 'CO 85 Bn' },
  { id: 'ESC-005', battalion: '142 Bn', force: 'CRPF', caseType: 'Voice NLP Critical', severity: 'moderate', daysPending: 2, lastUpdate: '12h ago', assignedTo: 'WO 142 Bn' },
];

const MOCK_CROSS_UNIT: CrossUnitComparison[] = MOCK_SECTOR_BATTALIONS.map(b => ({
  unit: b.battalion,
  force: b.force,
  stressIndex: b.avgStress,
  readinessScore: b.readinessScore,
  fatigueFlags: b.fatigueFlags,
  interventionLoad: Math.floor(b.activeCases * 3 + b.fatigueFlags * 0.5),
}));

export const SeniorCommandDashboardTab: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sectorData, setSectorData] = useState<SectorBattalionSummary[]>(MOCK_SECTOR_BATTALIONS);
  const [trendData, setTrendData] = useState<SectorTrendPoint[]>(MOCK_SECTOR_TREND);
  const [escalatedCases, setEscalatedCases] = useState<EscalatedCase[]>(MOCK_ESCALATED_CASES);
  const [selectedBattalion, setSelectedBattalion] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const totalPersonnel = sectorData.reduce((sum, b) => sum + b.strength, 0);
  const avgSectorStress = +(sectorData.reduce((sum, b) => sum + b.avgStress, 0) / sectorData.length).toFixed(1);
  const avgSectorReadiness = Math.round(sectorData.reduce((sum, b) => sum + b.readinessScore, 0) / sectorData.length);
  const totalFatigueFlags = sectorData.reduce((sum, b) => sum + b.fatigueFlags, 0);
  const totalEscalatedCases = escalatedCases.length;
  const criticalEscalated = escalatedCases.filter(c => c.severity === 'critical').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'high': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'moderate': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
    }
  };

  const radarData = sectorData.map(b => ({
    battalion: b.battalion,
    stress: Math.round((10 - b.avgStress) * 10),
    readiness: b.readinessScore,
    fatigueControl: Math.max(0, 100 - b.fatigueFlags * 3),
  }));

  if (loading) {
    return <BrandedLoader label="Loading Sector Command overview…" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/40">
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sector Command Overview</h2>
          </div>
          <p className="text-xs text-olive-400 font-mono ml-11">
            Northern Sector HQ • 6 Battalions • {totalPersonnel.toLocaleString()} Personnel • Anonymized Aggregate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-violet-400 bg-violet-500/15 px-3 py-1.5 rounded-full border border-violet-500/30">
            SECTOR COMMAND (IG/DIG)
          </span>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs font-mono text-olive-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-olive-700 hover:border-olive-500 transition-colors"
          >
            {showRawData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showRawData ? 'Hide Raw' : 'Show Raw'}
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Sector Avg Stress</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{avgSectorStress}<span className="text-sm text-olive-400">/10</span></div>
          <div className="mt-1.5 h-1.5 rounded-full bg-olive-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" style={{ width: `${(10 - avgSectorStress) * 10}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Avg Readiness</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{avgSectorReadiness}<span className="text-sm text-olive-400">%</span></div>
          <div className="mt-1.5 h-1.5 rounded-full bg-olive-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avgSectorReadiness}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Fatigue Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{totalFatigueFlags}</div>
          <p className="mt-1.5 text-[10px] text-olive-400 font-mono">Across {sectorData.length} battalions</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Escalated</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{totalEscalatedCases}</div>
          <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{criticalEscalated} critical</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Battalion Heatmap Table */}
        <div className="lg:col-span-2 rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-gold" />
              Battalion Stress Heatmap — Anonymized Aggregate
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-olive-700">
                  <th className="text-left py-2 px-2 text-olive-400 font-mono">Battalion</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Force</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Strength</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Avg Stress</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Fatigue</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Readiness</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Burn Risk</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Esc.</th>
                  <th className="text-center py-2 px-2 text-olive-400 font-mono">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sectorData.map((b) => {
                  const stressColor = b.avgStress >= 7.5 ? 'text-rose-400' : b.avgStress >= 6.5 ? 'text-amber-400' : 'text-emerald-400';
                  const readinessColor = b.readinessScore >= 80 ? 'text-emerald-400' : b.readinessScore >= 70 ? 'text-amber-400' : 'text-rose-400';
                  const riskColor = b.burnoutRisk >= 25 ? 'bg-rose-500/30' : b.burnoutRisk >= 15 ? 'bg-amber-500/30' : 'bg-emerald-500/30';
                  return (
                    <tr key={b.battalion} className="border-b border-olive-800/60 hover:bg-olive-800/40 transition-colors">
                      <td className="py-2.5 px-2">
                        <button
                          onClick={() => setSelectedBattalion(selectedBattalion === b.battalion ? null : b.battalion)}
                          className="text-white font-bold hover:text-accent-gold transition-colors text-left"
                        >
                          {b.battalion}
                        </button>
                        <p className="text-[10px] text-olive-500 font-mono">{b.location}</p>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-olive-300 font-mono text-[10px] bg-olive-800/60 px-1.5 py-0.5 rounded">{b.force}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-white font-mono">{b.strength}</td>
                      <td className={`py-2.5 px-2 text-center font-black font-mono ${stressColor}`}>{b.avgStress}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${b.fatigueFlags > 15 ? 'bg-rose-500/30 text-rose-400' : b.fatigueFlags > 10 ? 'bg-amber-500/30 text-amber-400' : 'bg-emerald-500/30 text-emerald-400'}`}>
                          {b.fatigueFlags}
                        </span>
                      </td>
                      <td className={`py-2.5 px-2 text-center font-mono font-bold ${readinessColor}`}>{b.readinessScore}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${riskColor}`}>{b.burnoutRisk}%</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-rose-400 font-mono">{b.activeCases}</td>
                      <td className="py-2.5 px-2 text-center">
                        {b.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-rose-400 mx-auto" /> : b.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-olive-500 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Radar Chart */}
        <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-accent-gold" />
            Battalion Performance Radar
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2f3d29" />
              <PolarAngleAxis dataKey="battalion" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="Stress Inversion" dataKey="stress" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Radar name="Readiness" dataKey="readiness" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Radar name="Fatigue Control" dataKey="fatigueControl" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Escalated Cases */}
      <div className="rounded-2xl bg-olive-900/70 border border-rose-500/30 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-400" />
            Escalated Cases — Require Senior Command Attention
          </h3>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/15 px-2 py-1 rounded-full border border-rose-500/30">
            {totalEscalatedCases} Active
          </span>
        </div>
        <div className="space-y-2">
          {escalatedCases.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-olive-950/80 border border-olive-700/60 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${getSeverityColor(c.severity)}`}>
                  {c.severity.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{c.caseType}</p>
                  <p className="text-[10px] text-olive-400 font-mono">{c.battalion} • {c.force}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-olive-400">{c.daysPending}d pending</p>
                <p className="text-[10px] text-olive-500">{c.lastUpdate}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-olive-300">{c.assignedTo}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-olive-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Sector Trend Chart */}
      <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-gold" />
            14-Day Sector Stress & Readiness Trend
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="left" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1a2e1a', border: '1px solid #374151', borderRadius: '12px', fontSize: '11px' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="sectorAvgStress" stroke="#f59e0b" strokeWidth={2} dot={false} name="Avg Stress" />
            <Line yAxisId="right" type="monotone" dataKey="sectorReadiness" stroke="#10b981" strokeWidth={2} dot={false} name="Readiness %" />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cross-Unit Comparison */}
      <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-accent-gold" />
          Cross-Unit Comparison — Anonymized
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MOCK_CROSS_UNIT}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
            <XAxis dataKey="unit" tick={{ fill: '#64748b', fontSize: 9 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid #374151', borderRadius: '12px', fontSize: '11px' }} />
            <Bar dataKey="stressIndex" fill="#f59e0b" name="Stress (inverted)" />
            <Bar dataKey="readinessScore" fill="#10b981" name="Readiness" />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
