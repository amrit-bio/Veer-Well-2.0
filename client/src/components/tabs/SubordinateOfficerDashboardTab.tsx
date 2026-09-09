import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import {
  Users, Activity, AlertTriangle, CheckCircle2, Clock, MapPin,
  ArrowRight, TrendingUp, Shield, ClipboardList, Bell, UserCheck,
} from 'lucide-react';
import { BrandedLoader } from '../common/BrandedLoader';

interface PlatoonMember {
  id: string;
  name: string;
  rank: string;
  serviceNumber: string;
  stressIndex: number;
  fatigueFlags: number;
  status: 'operational' | 'monitor' | 'critical' | 'rest';
  lastCheck: string;
}

interface InterventionRequest {
  id: string;
  personnelName: string;
  serviceNumber: string;
  type: 'rest' | 'counseling' | 'medical' | 'reassignment';
  urgency: 'low' | 'medium' | 'high';
  description: string;
  status: 'pending' | 'actioned' | 'escalated';
  submittedAt: string;
  assignedTo?: string;
}

const MOCK_PLATOON: PlatoonMember[] = [
  { id: 'p1', name: 'HC Rajesh Kumar', rank: 'HC', serviceNumber: 'BSF-HC-4421', stressIndex: 4.2, fatigueFlags: 1, status: 'operational', lastCheck: '2h ago' },
  { id: 'p2', name: 'Constable Suresh Patel', rank: 'Cst', serviceNumber: 'BSF-CST-5512', stressIndex: 6.8, fatigueFlags: 3, status: 'monitor', lastCheck: '4h ago' },
  { id: 'p3', name: 'Constable Amit Singh', rank: 'Cst', serviceNumber: 'BSF-CST-3389', stressIndex: 8.1, fatigueFlags: 7, status: 'critical', lastCheck: '30m ago' },
  { id: 'p4', name: 'ASI Prakash Verma', rank: 'ASI', serviceNumber: 'BSF-ASI-2201', stressIndex: 5.1, fatigueFlags: 2, status: 'operational', lastCheck: '1d ago' },
  { id: 'p5', name: 'HC Meena Devi', rank: 'HC', serviceNumber: 'BSF-HC-6612', stressIndex: 7.4, fatigueFlags: 5, status: 'monitor', lastCheck: '3h ago' },
  { id: 'p6', name: 'Constable Ramesh Yadav', rank: 'Cst', serviceNumber: 'BSF-CST-7741', stressIndex: 3.8, fatigueFlags: 0, status: 'rest', lastCheck: '1d ago' },
  { id: 'p7', name: 'SI Vijay Kumar', rank: 'SI', serviceNumber: 'BSF-SI-1102', stressIndex: 5.6, fatigueFlags: 2, status: 'operational', lastCheck: '6h ago' },
  { id: 'p8', name: 'Constable Sunil Joshi', rank: 'Cst', serviceNumber: 'BSF-CST-9923', stressIndex: 6.2, fatigueFlags: 4, status: 'monitor', lastCheck: '5h ago' },
];

const MOCK_INTERVENTIONS: InterventionRequest[] = [
  { id: 'INT-001', personnelName: 'Constable Amit Singh', serviceNumber: 'BSF-CST-3389', type: 'rest', urgency: 'high', description: 'Consecutive 14-day deployment without rest. Fatigue flags = 7.', status: 'pending', submittedAt: '2h ago' },
  { id: 'INT-002', personnelName: 'HC Meena Devi', serviceNumber: 'BSF-HC-6612', type: 'counseling', urgency: 'medium', description: 'Sleep quality dropping, PHQ-9 score trending up. Recommend counseling.', status: 'pending', submittedAt: '6h ago' },
  { id: 'INT-003', personnelName: 'Constable Ramesh Yadav', serviceNumber: 'BSF-CST-7741', type: 'rest', urgency: 'low', description: 'Auto-generated rest recommendation. Fatigue recovery in progress.', status: 'actioned', submittedAt: '1d ago', assignedTo: 'SI Manoj Tiwari' },
  { id: 'INT-004', personnelName: 'Constable Suresh Patel', serviceNumber: 'BSF-CST-5512', type: 'medical', urgency: 'medium', description: 'SpO₂ averaging 91% at altitude. Recommend medical check.', status: 'escalated', submittedAt: '12h ago', assignedTo: 'MO BSF 142 Bn' },
];

const MOCK_TREND = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    avgStress: +(4 + Math.random() * 3).toFixed(1),
    fatigueFlags: Math.floor(Math.random() * 6),
    readiness: Math.round(70 + Math.random() * 25),
  };
});

export const SubordinateOfficerDashboardTab: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [platoon, setPlatoon] = useState<PlatoonMember[]>(MOCK_PLATOON);
  const [interventions, setInterventions] = useState<InterventionRequest[]>(MOCK_INTERVENTIONS);
  const [showPending, setShowPending] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const operational = platoon.filter(p => p.status === 'operational').length;
  const monitor = platoon.filter(p => p.status === 'monitor').length;
  const critical = platoon.filter(p => p.status === 'critical').length;
  const rest = platoon.filter(p => p.status === 'rest').length;
  const pendingInterventions = interventions.filter(i => i.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
      case 'monitor': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'critical': return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'rest': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-rose-400 bg-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const handleEscalate = (id: string) => {
    setInterventions(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'escalated' as const, assignedTo: 'CO 142 Bn' } : i
    ));
  };

  const handleAction = (id: string) => {
    setInterventions(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'actioned' as const, assignedTo: 'SI Manoj Tiwari' } : i
    ));
  };

  if (loading) {
    return <BrandedLoader label="Loading Platoon Command view…" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Platoon Command</h2>
          </div>
          <p className="text-xs text-olive-400 font-mono ml-11">
            C Company, 142 Bn (BSF) • {platoon.length} Personnel • First-Line Triage View
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/30">
            SUBORDINATE OFFICER (SI/ASI/SUB)
          </span>
          {pendingInterventions > 0 && (
            <button
              onClick={() => onNavigate?.('interventions')}
              className="text-xs font-mono text-rose-400 bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-500/30 flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              {pendingInterventions} Pending
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/80 to-olive-950 border border-emerald-500/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Operational</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{operational}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-900/80 to-olive-950 border border-amber-500/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Monitor</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{monitor}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-900/80 to-olive-950 border border-rose-500/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase">Critical</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{critical}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/80 to-olive-950 border border-blue-500/40 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase">On Rest</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400">{rest}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platoon Status Table */}
        <div className="lg:col-span-2 rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-accent-gold" />
              Platoon Personnel Status
            </h3>
          </div>
          <div className="space-y-2">
            {platoon.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-olive-950/80 border border-olive-700/60 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-olive-800 border border-olive-600 flex items-center justify-center text-xs font-bold text-olive-300">
                    {member.rank.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{member.name}</p>
                    <p className="text-[10px] text-olive-500 font-mono">{member.serviceNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-olive-400">Stress</p>
                    <p className={`text-xs font-mono font-bold ${member.stressIndex >= 7.5 ? 'text-rose-400' : member.stressIndex >= 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {member.stressIndex}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-olive-400">Flags</p>
                    <p className={`text-xs font-mono font-bold ${member.fatigueFlags > 5 ? 'text-rose-400' : member.fatigueFlags > 2 ? 'text-amber-400' : 'text-olive-400'}`}>
                      {member.fatigueFlags}
                    </p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-[10px] text-olive-500">{member.lastCheck}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${getStatusBadge(member.status)}`}>
                    {member.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Trend */}
        <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent-gold" />
            7-Day Platoon Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MOCK_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis yAxisId="left" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid #374151', borderRadius: '12px', fontSize: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="avgStress" stroke="#f59e0b" strokeWidth={2} dot={false} name="Stress" />
              <Line yAxisId="right" type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={2} dot={false} name="Readiness" />
              <Legend wrapperStyle={{ fontSize: '9px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intervention Requests */}
      <div className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent-gold" />
            First-Line Intervention Requests
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPending(true)}
              className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-colors ${showPending ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'text-olive-400 border-olive-700'}`}
            >
              Pending ({interventions.filter(i => i.status === 'pending').length})
            </button>
            <button
              onClick={() => setShowPending(false)}
              className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-colors ${!showPending ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-olive-400 border-olive-700'}`}
            >
              All
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {interventions
            .filter(i => showPending ? i.status === 'pending' : true)
            .map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-olive-950/80 border border-olive-700/60">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${getUrgencyBadge(req.urgency)}`}>
                    {req.type === 'rest' ? <Clock className="w-3.5 h-3.5" /> : req.type === 'counseling' ? <Users className="w-3.5 h-3.5" /> : req.type === 'medical' ? <Activity className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{req.personnelName}</p>
                      <span className="text-[10px] font-mono text-olive-500">{req.serviceNumber}</span>
                    </div>
                    <p className="text-[11px] text-olive-300 mt-0.5">{req.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${getUrgencyBadge(req.urgency)}`}>{req.urgency.toUpperCase()}</span>
                      <span className="text-[9px] text-olive-500">{req.submittedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Action
                      </button>
                      <button
                        onClick={() => handleEscalate(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                  {req.status === 'actioned' && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/40">
                      Actioned • {req.assignedTo}
                    </span>
                  )}
                  {req.status === 'escalated' && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/40">
                      Escalated • {req.assignedTo}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
