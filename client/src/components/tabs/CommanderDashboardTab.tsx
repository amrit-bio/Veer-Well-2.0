import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  Activity,
  Heart,
  Zap,
  Award,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Radio,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Role-based data converter
const convertDataForRole = (role: string, originalData: any) => {
  // This allows backend to serve the same API but convert output based on viewing role
  return {
    ...originalData,
    // Role-specific transformations would happen here
    // For example: anonymizing names for commander vs detailed for welfare_officer
  };
};

interface CommanderMetrics {
  readinessScore: number;
  avgStress: number;
  fatigueFlags: number;
  restAuthorizations: number;
  lastSyncTime: string;
}

interface BattalionData {
  name: string;
  readiness: number;
  stress: number;
  workload: number;
  personnel: number;
  alerts: number;
  location: string;
}

interface PersonnelAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  unit: string;
  personnel: number;
  message: string;
  action: string;
  timestamp: string;
}

const CountUp: React.FC<{ value: number; suffix?: string; prefix?: string; decimals?: number }> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const duration = 800;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

export const CommanderDashboardTab: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Main Tab Navigation
  type MainTab = 'overview' | 'readiness' | 'roster' | 'alerts' | 'reports';
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('overview');

  // Subtabs for each main tab
  const [activeSubTab, setActiveSubTab] = useState<string>('summary');

  // Live Metrics
  const [metrics, setMetrics] = useState<CommanderMetrics>({
    readinessScore: 84,
    avgStress: 4.8,
    fatigueFlags: 3,
    restAuthorizations: 12,
    lastSyncTime: 'Just now',
  });

  // Battalion Data (aggregated view)
  const [battalionData, setBattalionData] = useState<BattalionData[]>([
    {
      name: '142 Bn (Srinagar)',
      readiness: 76,
      stress: 5.8,
      workload: 52,
      personnel: 450,
      alerts: 3,
      location: 'Srinagar Sector',
    },
    {
      name: '209 CoBRA (Gaya)',
      readiness: 84,
      stress: 4.6,
      workload: 44,
      personnel: 320,
      alerts: 1,
      location: 'Central Region',
    },
    {
      name: '88 Mahila Bn (Delhi)',
      readiness: 89,
      stress: 3.8,
      workload: 38,
      personnel: 280,
      alerts: 0,
      location: 'Delhi Cantonment',
    },
    {
      name: 'Leh Sector (ITBP)',
      readiness: 71,
      stress: 6.9,
      workload: 56,
      personnel: 180,
      alerts: 5,
      location: 'Ladakh Region',
    },
  ]);

  // Stress Distribution by Outpost
  const stressDistribution = [
    { name: 'Low (1-3)', value: 35, count: 280 },
    { name: 'Moderate (4-6)', value: 45, count: 720 },
    { name: 'High (7-9)', value: 15, count: 240 },
    { name: 'Critical (9+)', value: 5, count: 80 },
  ];

  const STRESS_COLORS = ['#10b981', '#eab308', '#f97316', '#ef4444'];

  // Personnel Wellness by Battalion
  const wellnessTimeline = [
    { day: 'Mon', personnel: 420, stress: 4.5, readiness: 82, alerts: 2 },
    { day: 'Tue', personnel: 418, stress: 4.8, readiness: 80, alerts: 3 },
    { day: 'Wed', personnel: 415, stress: 5.2, readiness: 78, alerts: 4 },
    { day: 'Thu', personnel: 420, stress: 4.9, readiness: 79, alerts: 3 },
    { day: 'Fri', personnel: 422, stress: 4.6, readiness: 81, alerts: 2 },
    { day: 'Sat', personnel: 425, stress: 4.2, readiness: 83, alerts: 1 },
    { day: 'Sun', personnel: 428, stress: 3.8, readiness: 85, alerts: 1 },
  ];

  // Roster Management Data
  const rotationSchedule = [
    { week: 'Week 1', scheduled: 120, onLeave: 24, available: 96, forecast: 110 },
    { week: 'Week 2', scheduled: 125, onLeave: 18, available: 107, forecast: 115 },
    { week: 'Week 3', scheduled: 130, onLeave: 30, available: 100, forecast: 120 },
    { week: 'Week 4', scheduled: 128, onLeave: 22, available: 106, forecast: 125 },
  ];

  // Battalion Radar Data
  const battalionRadarData = [
    { dimension: 'Readiness Index', '142Bn': 76, '209CoBRA': 84, '88Mahila': 89, 'LehSector': 71 },
    { dimension: 'Sleep Quality', '142Bn': 72, '209CoBRA': 80, '88Mahila': 85, 'LehSector': 65 },
    { dimension: 'Stress Management', '142Bn': 68, '209CoBRA': 78, '88Mahila': 82, 'LehSector': 60 },
    { dimension: 'Duty Load Balance', '142Bn': 70, '209CoBRA': 82, '88Mahila': 88, 'LehSector': 55 },
    { dimension: 'Personnel Morale', '142Bn': 75, '209CoBRA': 85, '88Mahila': 90, 'LehSector': 68 },
  ];

  // Alerts
  const [alerts, setAlerts] = useState<PersonnelAlert[]>([
    {
      id: 'alt-1',
      type: 'critical',
      title: 'High Altitude Circadian Strain Alert',
      unit: 'Leh Forward Outpost (ITBP)',
      personnel: 3,
      message: '3 personnel show consecutive nocturnal SpO2 drops and elevated fatigue index.',
      action: 'Initiate 48h Oxygen Recovery Protocol',
      timestamp: '12m ago',
    },
    {
      id: 'alt-2',
      type: 'warning',
      title: 'Workload Saturation Warning',
      unit: '142 Bn (Srinagar Sector HQ)',
      personnel: 2,
      message: 'Patrol shift length exceeded 52h/week threshold for 2 consecutive cycles.',
      action: 'Trigger Reserve Rest-Rotation Roster',
      timestamp: '1h ago',
    },
    {
      id: 'alt-3',
      type: 'warning',
      title: 'Sleep Deficit Cluster Detection',
      unit: '209 CoBRA (Gaya)',
      personnel: 8,
      message: '8 personnel averaging <6h sleep for past 5 days. Recovery score declining.',
      action: 'Escalate to Medical & Welfare Officer',
      timestamp: '2h ago',
    },
    {
      id: 'alt-4',
      type: 'info',
      title: 'Battalion Wellness Milestone',
      unit: '88 Mahila Bn',
      personnel: 280,
      message: '96.2% voluntary psychological wellness check-in completion achieved.',
      action: 'Acknowledge Unit Morale Leader',
      timestamp: '3h ago',
    },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        avgStress: Math.max(2.8, Math.min(7.5, Number((prev.avgStress + (Math.random() - 0.5) * 0.3).toFixed(1)))),
        readinessScore: Math.round(100 - metrics.avgStress * 4.5 + Math.random() * 10),
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, [metrics.avgStress]);

  // Main Tab Content Renderer
  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'overview':
        return renderOverviewTab();
      case 'readiness':
        return renderReadinessTab();
      case 'roster':
        return renderRosterTab();
      case 'alerts':
        return renderAlertsTab();
      case 'reports':
        return renderReportsTab();
      default:
        return null;
    }
  };

  // OVERVIEW TAB
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Battalion Readiness Index',
            value: metrics.readinessScore,
            suffix: '/100',
            color: 'accent-gold',
            change: '+4.2%',
            detail: 'Overall operational strength',
          },
          {
            title: 'Avg Stress Index',
            value: metrics.avgStress,
            suffix: '/10',
            decimals: 1,
            color: 'amber',
            change: '-0.3',
            detail: 'Moderate operational tempo',
          },
          {
            title: 'Fatigue Outpost Flags',
            value: metrics.fatigueFlags,
            suffix: ' Outposts',
            color: 'rose',
            change: '+1',
            detail: 'High shift load / Leh Sector',
          },
          {
            title: 'Pending Rest Authorizations',
            value: metrics.restAuthorizations,
            suffix: ' Requests',
            color: 'cyan',
            change: '+2',
            detail: '48h rotation queue ready',
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-olive-400/20 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
              <span className="text-xs font-semibold text-olive-300 uppercase tracking-wider">{card.title}</span>
              <div className="text-3xl font-black text-white mt-2">
                <CountUp value={card.value} suffix={card.suffix} decimals={card.decimals} />
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-300 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{card.change}</span>
              </div>
              <p className="text-[10px] text-olive-300 mt-1">{card.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Stress Orb */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-olive-400/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-gold" />
                Battalion Stress Resonance Centerpiece
              </h2>
              <p className="text-xs text-olive-300 mt-1">
                Real-time physiological turbulence across deployed units
              </p>
            </div>
            <span className="text-xs font-mono text-accent-gold font-bold">Index: {metrics.avgStress}/10</span>
          </div>
          <div className="py-8 px-4 rounded-xl bg-olive-900/40 border border-olive-700/30 text-center">
            <p className="text-xs text-olive-300 mb-2">Average Battalion Stress</p>
            <p className="text-4xl font-black text-accent-gold">{metrics.avgStress}</p>
            <p className="text-xs text-olive-400 mt-1">Personnel at risk: 4</p>
          </div>
        </div>

        {/* Stress Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-gold" />
            Personnel Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stressDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STRESS_COLORS[index % STRESS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#192215',
                    borderColor: '#435a37',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs mt-3 border-t border-olive-800 pt-3">
            {stressDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STRESS_COLORS[idx] }} />
                  {item.name}
                </span>
                <strong className="text-white">{item.count} personnel</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wellness Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-gold" />
            7-Day Personnel Wellness Trend
          </h2>
          <span className="text-[10px] font-mono text-olive-300">Aggregated View</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wellnessTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
              <XAxis dataKey="day" stroke="#8faa80" />
              <YAxis stroke="#8faa80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#192215',
                  borderColor: '#435a37',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="readiness"
                name="Readiness Score"
                stroke="#eab308"
                fill="#eab308"
                fillOpacity={0.3}
              />
              <Area type="monotone" dataKey="stress" name="Avg Stress" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // READINESS TAB
  const renderReadinessTab = () => (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {[
          { id: 'battalion-comparison', label: 'Battalion Comparison' },
          { id: 'dimensions', label: 'Readiness Dimensions' },
          { id: 'personnel-health', label: 'Personnel Health Score' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-accent-gold text-navy-950 font-black'
                : 'text-olive-300 hover:text-white hover:bg-olive-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'battalion-comparison' && (
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h2 className="text-base font-bold text-white mb-4">Battalion Performance Matrix</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={battalionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
                <XAxis dataKey="name" stroke="#8faa80" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8faa80" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#192215',
                    borderColor: '#435a37',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="readiness" fill="#eab308" name="Readiness Score" />
                <Bar dataKey="stress" fill="#f97316" name="Avg Stress" />
                <Bar dataKey="workload" fill="#06b6d4" name="Workload (hrs/week)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'dimensions' && (
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h2 className="text-base font-bold text-white mb-4">Readiness Dimensions by Battalion</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={battalionRadarData}>
                <PolarGrid stroke="#435a37" />
                <PolarAngleAxis dataKey="dimension" stroke="#b4c7a9" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis stroke="#6f8e5f" domain={[0, 100]} />
                <Radar name="142 Bn" dataKey="142Bn" stroke="#eab308" fill="#eab308" fillOpacity={0.15} />
                <Radar name="209 CoBRA" dataKey="209CoBRA" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Radar name="88 Mahila Bn" dataKey="88Mahila" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                <Radar name="Leh Sector" dataKey="LehSector" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'personnel-health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {battalionData.map((battalion, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="glass-panel p-5 rounded-2xl border border-olive-400/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{battalion.name}</h3>
                <span className="text-xs font-mono text-olive-300">{battalion.personnel} personnel</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-olive-300">Readiness Index</span>
                  <span className="text-accent-gold font-bold">{battalion.readiness}/100</span>
                </div>
                <div className="w-full bg-olive-900/50 rounded-full h-2">
                  <div
                    className="bg-accent-gold h-full rounded-full transition-all"
                    style={{ width: `${battalion.readiness}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-olive-300">Stress Level</span>
                  <span className={battalion.stress > 5.5 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {battalion.stress}/10
                  </span>
                </div>
                <div className="w-full bg-olive-900/50 rounded-full h-2">
                  <div
                    className={battalion.stress > 5.5 ? 'bg-rose-500' : 'bg-emerald-500'}
                    style={{ width: `${(battalion.stress / 10) * 100}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-olive-800 flex items-center gap-2 mt-3">
                  {battalion.alerts > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                      {battalion.alerts} Active Alerts
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded bg-olive-900 text-olive-300 font-mono">
                    {battalion.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // ROSTER TAB
  const renderRosterTab = () => (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {[
          { id: 'schedule', label: 'Rotation Schedule' },
          { id: 'forecast', label: 'Personnel Forecast' },
          { id: 'availability', label: 'Availability Matrix' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-accent-gold text-navy-950 font-black'
                : 'text-olive-300 hover:text-white hover:bg-olive-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'schedule' && (
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h2 className="text-base font-bold text-white mb-4">4-Week Rotation Schedule</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rotationSchedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
                <XAxis dataKey="week" stroke="#8faa80" />
                <YAxis stroke="#8faa80" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#192215',
                    borderColor: '#435a37',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="scheduled" fill="#eab308" name="Scheduled Personnel" />
                <Bar dataKey="onLeave" fill="#f97316" name="On Leave/Rest" />
                <Bar dataKey="available" fill="#10b981" name="Available for Duty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'forecast' && (
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h2 className="text-base font-bold text-white mb-4">Personnel Availability Forecast</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rotationSchedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
                <XAxis dataKey="week" stroke="#8faa80" />
                <YAxis stroke="#8faa80" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#192215',
                    borderColor: '#435a37',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="available"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Currently Available"
                  dot={{ fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#eab308"
                  strokeWidth={2}
                  name="Forecasted Available"
                  dot={{ fill: '#eab308' }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
            <h3 className="text-base font-bold text-white mb-4">Current Week Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Active Duty', value: 120, color: 'accent-gold' },
                { label: 'On Medical Leave', value: 18, color: 'rose' },
                { label: 'Rest/Wellness Recharge', value: 12, color: 'emerald' },
                { label: 'Training/Special Duty', value: 8, color: 'cyan' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-olive-300">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value} personnel</span>
                  </div>
                  <div className="w-full bg-olive-900/50 rounded-full h-3">
                    <div
                      className={`bg-${item.color}-500 h-full rounded-full`}
                      style={{ width: `${(item.value / 158) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
            <h3 className="text-base font-bold text-white mb-4">Deployment Status by Unit</h3>
            <div className="space-y-2.5">
              {battalionData.map((bn, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-olive-900/50 border border-olive-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{bn.name}</span>
                    <span className="text-xs font-mono text-accent-gold">{bn.personnel} total</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-accent-gold/80 rounded-full" />
                    <div className="flex-1 h-2 bg-emerald-500/60 rounded-full" />
                    <div className="flex-1 h-2 bg-rose-500/40 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ALERTS TAB
  const renderAlertsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-accent-gold animate-pulse" />
          Active Personnel Alerts
        </h2>
        <span className="text-xs text-olive-300 font-mono">
          Last sync: {metrics.lastSyncTime}
        </span>
      </div>

      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          whileHover={{ x: 4 }}
          className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
            alert.type === 'critical'
              ? 'bg-rose-950/40 border-rose-500/40'
              : alert.type === 'warning'
                ? 'bg-amber-950/30 border-amber-500/30'
                : 'bg-olive-900/50 border-olive-700/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  alert.type === 'critical'
                    ? 'bg-rose-500/20 text-rose-400'
                    : alert.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {alert.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{alert.title}</h3>
                <p className="text-[11px] text-olive-300 mt-0.5">{alert.unit}</p>
                <p className="text-xs text-slate-300 mt-1.5">{alert.message}</p>
              </div>
            </div>
            <span className="text-[10px] text-olive-400 font-mono whitespace-nowrap ml-2">{alert.timestamp}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-20">
            <span className="text-xs text-olive-300 font-mono">
              Personnel Affected: <strong>{alert.personnel}</strong>
            </span>
            <button
              onClick={() => onNavigate('interventions')}
              className="text-xs px-3 py-1 rounded-lg bg-accent-gold/20 hover:bg-accent-gold/40 text-accent-gold font-bold transition-all"
            >
              {alert.action}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // REPORTS TAB
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {[
          { id: 'summary', label: 'Executive Summary' },
          { id: 'detailed', label: 'Detailed Analytics' },
          { id: 'export', label: 'Export Data' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-accent-gold text-navy-950 font-black'
                : 'text-olive-300 hover:text-white hover:bg-olive-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'summary' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
            <h2 className="text-base font-bold text-white mb-4">Weekly Command Report</h2>
            <div className="space-y-3 text-sm text-olive-200">
              <p>
                <strong className="text-white">Battalion Readiness:</strong> Overall readiness index stands at{' '}
                <span className="text-accent-gold font-bold">{metrics.readinessScore}/100</span>, indicating stable operational
                capacity across deployed units.
              </p>
              <p>
                <strong className="text-white">Stress Levels:</strong> Average stress index is{' '}
                <span className="text-accent-gold font-bold">{metrics.avgStress}/10</span>. Leh Sector shows elevated stress due to
                high altitude operations.
              </p>
              <p>
                <strong className="text-white">Personnel Wellness:</strong> <span className="text-emerald-400 font-bold">1,230</span>{' '}
                personnel across 4 battalions. <span className="text-amber-300 font-bold">3 fatigue flags</span> detected requiring
                immediate intervention.
              </p>
              <p>
                <strong className="text-white">Recommendations:</strong> Consider rotating personnel from Leh Sector for 48-hour
                wellness recharge. Escalate sleep deficit alerts to Medical & Welfare Officer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-olive-400/30">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Key Improvements
              </h3>
              <ul className="space-y-2 text-xs text-olive-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>88 Mahila Bn achieving 96%+ wellness engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>209 CoBRA stress levels declining week-over-week</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>12 successful rest rotations completed this week</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-olive-400/30">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Areas of Concern
              </h3>
              <ul className="space-y-2 text-xs text-olive-200">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span>Leh Sector: High altitude circadian disruption (3 personnel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span>142 Bn: Workload saturation exceeding thresholds</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span>Sleep deficit cluster in 209 CoBRA requiring escalation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'detailed' && (
        <div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
          <h2 className="text-base font-bold text-white mb-4">14-Day Detailed Analytics</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wellnessTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" />
                <XAxis dataKey="day" stroke="#8faa80" />
                <YAxis stroke="#8faa80" yAxisId="left" />
                <YAxis stroke="#8faa80" yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#192215',
                    borderColor: '#435a37',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="readiness"
                  stroke="#eab308"
                  name="Readiness Score"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="alerts"
                  stroke="#f97316"
                  name="Active Alerts"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeSubTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Battalion Summary Report', format: 'PDF', size: '2.4 MB' },
            { title: 'Personnel Health Data', format: 'CSV', size: '1.8 MB' },
            { title: 'Roster Schedule Export', format: 'XLSX', size: '856 KB' },
            { title: 'Compliance & Privacy Report', format: 'PDF', size: '3.2 MB' },
          ].map((report, idx) => (
            <button
              key={idx}
              className="p-4 rounded-2xl border border-olive-400/30 hover:border-accent-gold/50 bg-olive-950/50 hover:bg-olive-900/50 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-accent-gold transition-colors">{report.title}</h3>
                  <p className="text-xs text-olive-300 mt-1">{report.format} • {report.size}</p>
                </div>
                <Download className="w-5 h-5 text-olive-400 group-hover:text-accent-gold transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30 glow-olive">
        <div className="flex items-start gap-3 min-w-0">
          <BrandLogo size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Commanding Officer (CO) — Strategic Readiness Deck
              </span>
              <span className="text-xs text-olive-300 font-mono">Location: {user.location}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Command Readiness: {user.rank} {user.name}
            </h1>

            <p className="text-xs md:text-sm text-olive-200 mt-1 max-w-2xl">
              Battalion aggregates, border outpost fatigue monitoring, and rest rotation authorizations under the Welfare Doctrine
              (Individual names cryptographically masked).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2.5 rounded-xl bg-accent-gold text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>14-Day Forecast</span>
          </button>
          <button
            onClick={() => onNavigate('interventions')}
            className="px-4 py-2.5 rounded-xl bg-olive-900 border border-olive-400 hover:bg-olive-800 text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Authorize Rotations</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'readiness', label: 'Readiness', icon: Heart },
          { id: 'roster', label: 'Roster Mgmt', icon: Users },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveMainTab(id as MainTab);
              setActiveSubTab('summary');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === id
                ? 'bg-accent-gold text-navy-950 font-black shadow-md'
                : 'text-olive-300 hover:text-white hover:bg-olive-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeMainTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {renderMainTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
