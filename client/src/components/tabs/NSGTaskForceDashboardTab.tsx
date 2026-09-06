import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import {
  Shield, Activity, AlertTriangle, Zap, Clock, MapPin,
  Target, Radio, Crosshair, Siren, TrendingUp,
} from 'lucide-react';
import { BrandedLoader } from '../common/BrandedLoader';

interface NSGDeploymentSquad {
  id: string;
  codename: string;
  deploymentType: 'CT' | 'VIP' | 'bomb_disposal' | 'hostage_rescue';
  location: string;
  personnelCount: number;
  opsTempo: number;
  stressIndex: number;
  readinessScore: number;
  fatigueFlags: number;
  lastRotation: string;
  status: 'deployed' | 'standby' | 'recovery' | 'debrief';
}

interface NSGAlert {
  id: string;
  type: 'threat' | 'medical' | 'fatigue' | 'equipment' | 'rotation';
  severity: 'critical' | 'high' | 'medium';
  location: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

interface OpsReadinessMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

const MOCK_NSG_SQUADS: NSGDeploymentSquad[] = [
  { id: 's1', codename: 'Squad Alpha', deploymentType: 'CT', location: 'Delhi NCR', personnelCount: 24, opsTempo: 87, stressIndex: 5.2, readinessScore: 91, fatigueFlags: 2, lastRotation: '3d ago', status: 'deployed' },
  { id: 's2', codename: 'Squad Bravo', deploymentType: 'VIP', location: 'Mumbai', personnelCount: 18, opsTempo: 72, stressIndex: 4.8, readinessScore: 88, fatigueFlags: 1, lastRotation: '5d ago', status: 'standby' },
  { id: 's3', codename: 'Squad Charlie', deploymentType: 'bomb_disposal', location: 'Chennai', personnelCount: 12, opsTempo: 95, stressIndex: 7.1, readinessScore: 79, fatigueFlags: 5, lastRotation: '2d ago', status: 'recovery' },
  { id: 's4', codename: 'Squad Delta', deploymentType: 'hostage_rescue', location: 'Kolkata', personnelCount: 20, opsTempo: 68, stressIndex: 6.3, readinessScore: 82, fatigueFlags: 3, lastRotation: '1w ago', status: 'debrief' },
  { id: 's5', codename: 'Squad Echo', deploymentType: 'CT', location: 'Hyderabad', personnelCount: 22, opsTempo: 91, stressIndex: 6.8, readinessScore: 85, fatigueFlags: 4, lastRotation: '4d ago', status: 'deployed' },
];

const MOCK_ALERTS: NSGAlert[] = [
  { id: 'a1', type: 'fatigue', severity: 'high', location: 'Squad Charlie', description: 'Ops tempo 95% for 48h — BD squad requires mandatory 24h recovery before next callout.', timestamp: '1h ago', acknowledged: false },
  { id: 'a2', type: 'rotation', severity: 'medium', location: 'Squad Alpha', description: 'Rotation overdue by 24h. Replace with Squad Echo at Delhi NCR perimeter.', timestamp: '3h ago', acknowledged: false },
  { id: 'a3', type: 'equipment', severity: 'medium', location: 'Squad Delta', description: 'Protective gear recalibration due — 2 EOD suits pending certification.', timestamp: '6h ago', acknowledged: true },
  { id: 'a4', type: 'medical', severity: 'high', location: 'Squad Charlie', description: 'One team member reports SpO₂ 89% post-deep burial operation. Medical clearance required before re-deployment.', timestamp: '2h ago', acknowledged: false },
  { id: 'a5', type: 'threat', severity: 'critical', location: 'Squad Echo', description: 'Intelligence input: potential VBIED in Hyderabad sector. Squad on high alert — stress monitoring active.', timestamp: '45m ago', acknowledged: false },
];

const MOCK_OPS_READINESS: OpsReadinessMetric[] = [
  { category: 'Tactical Readiness', score: 89, trend: 'stable' },
  { category: 'Medical Fitness', score: 84, trend: 'down' },
  { category: 'Equipment Status', score: 91, trend: 'stable' },
  { category: 'Psychological Resilience', score: 78, trend: 'down' },
  { category: 'Rotation Compliance', score: 72, trend: 'down' },
  { category: 'CT Specialist Skills', score: 94, trend: 'stable' },
];

const MOCK_OPS_TREND = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    opsTempo: Math.round(65 + Math.random() * 30),
    readiness: Math.round(75 + Math.random() * 20),
    fatigueIndex: Math.round(10 + Math.random() * 15),
  };
});

const getDeploymentTypeColor = (type: string) => {
  switch (type) {
    case 'CT': return 'bg-red-500/20 text-rose-400 border-red-500/40';
    case 'VIP': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'bomb_disposal': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'hostage_rescue': return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'deployed': return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
    case 'standby': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
    case 'recovery': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    case 'debrief': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    default: return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
  }
};

const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
    case 'high': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    case 'medium': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
    default: return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'threat': return <Crosshair className="w-4 h-4 text-rose-400" />;
    case 'medical': return <Activity className="w-4 h-4 text-rose-400" />;
    case 'fatigue': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'equipment': return <Shield className="w-4 h-4 text-blue-400" />;
    case 'rotation': return <Clock className="w-4 h-4 text-emerald-400" />;
    default: return <Zap className="w-4 h-4 text-slate-400" />;
  }
};

export const NSGTaskForceDashboardTab: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [squads, setSquads] = useState<NSGDeploymentSquad[]>(MOCK_NSG_SQUADS);
  const [alerts, setAlerts] = useState<NSGAlert[]>(MOCK_ALERTS);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const totalPersonnel = squads.reduce((sum, s) => sum + s.personnelCount, 0);
  const deployed = squads.filter(s => s.status === 'deployed').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const avgReadiness = Math.round(squads.reduce((sum, s) => sum + s.readinessScore, 0) / squads.length);
  const avgOpsTempo = Math.round(squads.reduce((sum, s) => sum + s.opsTempo, 0) / squads.length);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  if (loading) {
    return <BrandedLoader label="Loading NSG Task Force Command…" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">NSG Task Force Command</h2>
          </div>
          <p className="text-xs text-olive-400 font-mono ml-11">
            NSG Special Action Group (SAG) • {squads.length} Squads • {totalPersonnel} Personnel • Parent Force: CRPF
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unacknowledgedAlerts > 0 && (
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-500/30 flex items-center gap-1.5">
              <Siren className="w-3.5 h-3.5" />
              {unacknowledgedAlerts} Unacknowledged
            </span>
          )}
          <span className="text-[10px] font-mono text-red-400 bg-red-500/15 px-3 py-1.5 rounded-full border border-red-500/30">
            NSG TASK FORCE
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-red-900/80 to-olive-950 border border-red-500/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-red-400 uppercase">Active Alerts</span>
            <Siren className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{unacknowledgedAlerts}</div>
          {criticalAlerts > 0 && <p className="text-[10px] text-rose-400 font-mono mt-1">{criticalAlerts} critical</p>}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">Avg Readiness</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{avgReadiness}<span className="text-sm text-olive-400">%</span></div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">Ops Tempo</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{avgOpsTempo}<span className="text-sm text-olive-400">%</span></div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">Deployed</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">{deployed}<span className="text-sm text-olive-400">/{squads.length}</span></div>
        </div>
      </div>

      {/* Squad Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {squads.map((squad) => (
          <div key={squad.id} className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40">
                  <Crosshair className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{squad.codename}</p>
                  <p className="text-[10px] text-olive-500 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{squad.location}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${getDeploymentTypeColor(squad.deploymentType)}`}>
                {squad.deploymentType.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-xl bg-olive-950/80">
                <p className="text-[10px] text-olive-500 font-mono">Personnel</p>
                <p className="text-sm font-black text-white">{squad.personnelCount}</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-olive-950/80">
                <p className="text-[10px] text-olive-500 font-mono">Ops Tempo</p>
                <p className={`text-sm font-black ${squad.opsTempo > 90 ? 'text-rose-400' : squad.opsTempo > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>{squad.opsTempo}%</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-olive-950/80">
                <p className="text-[10px] text-olive-500 font-mono">Readiness</p>
                <p className={`text-sm font-black ${squad.readinessScore < 75 ? 'text-rose-400' : squad.readinessScore < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>{squad.readinessScore}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${getStatusColor(squad.status)}`}>
                  {squad.status.toUpperCase()}
                </span>
                {squad.fatigueFlags > 3 && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <AlertTriangle className="w-3 h-3" />{squad.fatigueFlags} flags
                  </span>
                )}
              </div>
              <span className="text-[10px] text-olive-500">Rot: {squad.lastRotation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Panel */}
        <div className="rounded-2xl bg-olive-900/70 border border-rose-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400" />
              NSG Operational Alerts
            </h3>
            <button
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className="text-[10px] font-mono text-olive-400 hover:text-white px-2 py-1 rounded border border-olive-700 transition-colors"
            >
              {showAcknowledged ? 'Hide Acknowledged' : 'Show All'}
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts
              .filter(a => showAcknowledged || !a.acknowledged)
              .map((alert) => (
                <div key={alert.id} className={`flex items-start justify-between p-3 rounded-xl border ${alert.acknowledged ? 'bg-olive-950/60 border-olive-800/60 opacity-60' : 'bg-olive-950/80 border-olive-700/60'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">{alert.type.replace('_', ' ').toUpperCase()}</p>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-olive-300 mt-0.5">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-olive-500 font-mono">{alert.location}</span>
                        <span className="text-[9px] text-olive-500">•</span>
                        <span className="text-[9px] text-olive-500 font-mono">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold hover:bg-emerald-500/30 transition-colors shrink-0"
                    >
                      ACK
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Ops Readiness Metrics */}
        <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent-gold" />
            NSG Operational Readiness Metrics
          </h3>
          <div className="space-y-3">
            {MOCK_OPS_READINESS.map((metric) => (
              <div key={metric.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-olive-300">{metric.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${metric.score < 75 ? 'text-rose-400' : metric.score < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {metric.score}%
                    </span>
                    {metric.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : metric.trend === 'down' ? <TrendingUp className="w-3 h-3 text-rose-400 rotate-180" /> : null}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-olive-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${metric.score >= 85 ? 'bg-emerald-500' : metric.score >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14-Day Ops Trend */}
      <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-accent-gold" />
          14-Day NSG Task Force Operational Trend
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MOCK_OPS_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid #374151', borderRadius: '12px', fontSize: '11px' }} />
            <Line type="monotone" dataKey="opsTempo" stroke="#f59e0b" strokeWidth={2} dot={false} name="Ops Tempo %" />
            <Line type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={2} dot={false} name="Readiness %" />
            <Line type="monotone" dataKey="fatigueIndex" stroke="#ef4444" strokeWidth={2} dot={false} name="Fatigue Index" />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
