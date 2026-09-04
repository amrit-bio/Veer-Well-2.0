import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
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
  Calendar,
  Clock,
  Radio,
  MapPin,
  CheckCircle,
  RefreshCw,
  Eye,
  Shield,
  Award,
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

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

export const DashboardTab: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { user, role, isAnonymized } = useAuth();
  const [leaveApplied, setLeaveApplied] = useState(false);
  const [rotationApproved, setRotationApproved] = useState(false);
  const [dashView, setDashView] = useState<'overview' | 'alerts' | 'wearables'>('overview');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Live Fluctuating Telemetry State
  const [liveMetrics, setLiveMetrics] = useState({
    readinessScore: 84,
    avgStress: 4.8,
    heartRate: 68,
    spo2: 97.4,
    hrv: 64,
    sleepHours: 7.2,
    activeAlerts: 4,
    fatigueOutposts: 3,
  });

  // Unit Averages across CAPF / CRPF Battalions
  const [unitStats, setUnitStats] = useState([
    { name: '142 Bn (Srinagar)', wellness: 76, stress: 5.8, workloadHours: 52, fatigue: 64 },
    { name: '209 CoBRA (Gaya)', wellness: 84, stress: 4.6, workloadHours: 44, fatigue: 48 },
    { name: '88 Mahila Bn (Delhi)', wellness: 89, stress: 3.8, workloadHours: 38, fatigue: 32 },
    { name: 'Leh Sector (ITBP)', wellness: 71, stress: 6.9, workloadHours: 56, fatigue: 78 },
  ]);

  const [personal7DayData, setPersonal7DayData] = useState([
    { day: 'Mon', hrv: 62, sleepHours: 6.5, spo2: 98, recovery: 78 },
    { day: 'Tue', hrv: 58, sleepHours: 5.8, spo2: 97, recovery: 70 },
    { day: 'Wed', hrv: 65, sleepHours: 7.0, spo2: 98, recovery: 82 },
    { day: 'Thu', hrv: 60, sleepHours: 6.2, spo2: 97, recovery: 75 },
    { day: 'Fri', hrv: 70, sleepHours: 7.5, spo2: 99, recovery: 88 },
    { day: 'Sat', hrv: 68, sleepHours: 7.2, spo2: 98, recovery: 86 },
    { day: 'Sun', hrv: 72, sleepHours: 7.8, spo2: 99, recovery: 92 },
  ]);

  const radarData = [
    { dimension: 'Operational Stamina', score: Math.round(liveMetrics.readinessScore * 0.98) },
    { dimension: 'Sleep Architecture', score: Math.round(liveMetrics.sleepHours * 11.5) },
    { dimension: 'Psychological Safety', score: 88 },
    { dimension: 'HRV Autonomic Tone', score: liveMetrics.hrv },
    { dimension: 'Peer Support Index', score: 92 },
  ];

  const dutyScheduleTrends = [
    { day: 'Mon', activeDuty: 48, restRotation: 12, standby: 8 },
    { day: 'Tue', activeDuty: 52, restRotation: 10, standby: 6 },
    { day: 'Wed', activeDuty: 56, restRotation: 8, standby: 4 },
    { day: 'Thu', activeDuty: 50, restRotation: 14, standby: 4 },
    { day: 'Fri', activeDuty: 46, restRotation: 16, standby: 6 },
    { day: 'Sat', activeDuty: 42, restRotation: 20, standby: 6 },
    { day: 'Sun', activeDuty: 38, restRotation: 24, standby: 6 },
  ];

  const [welfareAlerts, setWelfareAlerts] = useState([
    {
      id: 'alt-1',
      type: 'critical' as const,
      title: 'High Altitude Circadian Strain Alert',
      unit: 'Leh Forward Outpost (ITBP)',
      msg: '3 personnel show consecutive nocturnal SpO2 drops and elevated fatigue index.',
      timeAgo: '12m ago',
      action: 'Initiate 48h Oxygen Recovery Protocol',
    },
    {
      id: 'alt-2',
      type: 'warning' as const,
      title: 'Workload Saturation Warning',
      unit: '142 Bn (Srinagar Sector HQ)',
      msg: 'Patrol shift length exceeded 52h/week threshold for 2 consecutive cycles.',
      timeAgo: '1h ago',
      action: 'Trigger Reserve Rest-Rotation Roster',
    },
    {
      id: 'alt-3',
      type: 'info' as const,
      title: 'Battalion Wellness Check-In Milestone',
      unit: '88 Mahila Bn',
      msg: '96.2% voluntary psychological wellness check-in completion achieved.',
      timeAgo: '3h ago',
      action: 'Acknowledge Unit Morale Leader',
    },
  ]);

  // Personnel accounts are deliberately limited to their own wellness context.
  // Command and clinical roles retain their authorised aggregate/triage views.
  const visibleUnitStats = role === 'personnel'
    ? [{ name: 'My personal wellness record', wellness: liveMetrics.readinessScore, stress: liveMetrics.avgStress, workloadHours: 0, fatigue: 0 }]
    : unitStats;
  const visibleDutyTrends = role === 'personnel'
    ? personal7DayData.map((entry) => ({
        day: entry.day,
        activeDuty: Math.round(entry.sleepHours * 5),
        restRotation: Math.round(entry.recovery / 5),
      }))
    : dutyScheduleTrends;
  const visibleWelfareAlerts = role === 'personnel'
    ? [{
        id: 'my-wellness-status',
        type: 'info' as const,
        title: 'My private wellness status',
        unit: user.unit,
        msg: 'Only you can view this personal recovery and assessment status.',
        timeAgo: 'Just now',
        action: 'Open confidential self-assessment',
      }]
    : welfareAlerts;

  // Real-Time Data Simulation Engine (Updates every 6 seconds)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setLiveMetrics((prev) => {
        const deltaStress = (Math.random() - 0.5) * 0.2;
        const newStress = Math.max(2.8, Math.min(7.5, Number((prev.avgStress + deltaStress).toFixed(1))));
        const newHR = Math.max(62, Math.min(84, Math.round(prev.heartRate + (Math.random() - 0.5) * 3)));
        const newHRV = Math.max(48, Math.min(78, Math.round(prev.hrv + (Math.random() - 0.5) * 4)));
        const newReadiness = Math.round(100 - newStress * 4.5 + (newHRV / 80) * 15);

        return {
          ...prev,
          avgStress: newStress,
          heartRate: newHR,
          hrv: newHRV,
          readinessScore: Math.min(96, Math.max(65, newReadiness)),
        };
      });

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Dynamic Role-Tailored Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30 glow-olive">
        <div className="flex items-start gap-3 min-w-0">
          <BrandLogo size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {role === 'commander' && 'Commanding Officer (CO) — Strategic Readiness Deck'}
                {role === 'welfare_officer' && 'Chief Medical & Welfare Officer — Clinical Triage Deck'}
                {role === 'personnel' && 'Frontline Sentinel — Personal Wellness & Wearables Deck'}
                {role === 'analyst' && 'Directorate Behavioral Scientist — Predictive Modeling Lab'}
              </span>
              <span className="text-xs text-olive-300 font-mono">Location: {user.location}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {role === 'commander' && `Command Readiness: ${user.rank} ${user.name}`}
              {role === 'welfare_officer' && `Clinical Triage: ${user.rank} ${user.name}`}
              {role === 'personnel' && `Personal Sentinel Hub: ${user.rank} ${isAnonymized ? user.anonymizedId : user.name}`}
              {role === 'analyst' && `Behavioral Intelligence: ${user.rank} ${user.name}`}
            </h1>

            <p className="text-xs md:text-sm text-olive-200 mt-1 max-w-2xl">
              {role === 'commander' && 'Commanding Officer View: Battalion aggregates, border outpost fatigue monitoring, and rest rotation authorizations under the Welfare Doctrine (Individual names cryptographically masked).'}
              {role === 'welfare_officer' && 'Medical Specialist View: Review acute physiological strain, prescribe 48h hypoxia recovery respite, and manage confidential mental health consultations.'}
              {role === 'personnel' && 'Personnel Self-Care View: Your biometric signals, voluntary PHQ-9 trends, and confidential 3-day Wellness Recharge leave status. Protected under the Sanctuary Rule.'}
              {role === 'analyst' && 'Data Analyst View: 14-day multi-variate burnout forecasts, operational shift regressions (r=0.81), and differential privacy compliance (k=5, ε=0.5).'}
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons per Role */}
        <div className="flex flex-wrap items-center gap-3">
          {role === 'commander' && (
            <>
              <button
                onClick={() => setRotationApproved(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-gold to-accent-saffron text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{rotationApproved ? '✓ 48h Rotations Approved' : 'Approve 48h Rest Roster'}</span>
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="px-4 py-2.5 rounded-xl bg-olive-900 border border-olive-400 hover:bg-olive-800 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-accent-gold" />
                <span>Roster Forecasts</span>
              </button>
            </>
          )}

          {role === 'welfare_officer' && (
            <>
              <button
                onClick={() => onNavigate('interventions')}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Prescribe Recovery Respite</span>
              </button>
              <button
                onClick={() => onNavigate('assessment')}
                className="px-4 py-2.5 rounded-xl bg-olive-900 border border-olive-400 hover:bg-olive-800 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <FileCheck2 className="w-4 h-4 text-accent-gold" />
                <span>Clinical Screeners</span>
              </button>
            </>
          )}

          {role === 'personnel' && (
            <>
              <button
                onClick={() => onNavigate('assessment')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Activity className="w-4 h-4" />
                <span>Take 2-Min Check-In</span>
              </button>
              <button
                onClick={() => setLeaveApplied(true)}
                className="px-4 py-2.5 rounded-xl bg-olive-900 border border-emerald-500 hover:bg-olive-800 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{leaveApplied ? '✓ 3-Day Wellness Leave Filed' : 'Apply 3-Day Wellness Leave'}</span>
              </button>
            </>
          )}

          {role === 'analyst' && (
            <>
              <button
                onClick={() => onNavigate('analytics')}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Simulator</span>
              </button>
              <button
                onClick={() => onNavigate('datasets')}
                className="px-4 py-2.5 rounded-xl bg-olive-900 border border-cyan-500 hover:bg-olive-800 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Ingest Dataset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-view Switcher & Live Sync Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        <div className="flex items-center gap-1.5">
          {([
            ['overview', 'Overview Grid'],
            ['alerts', 'Welfare Alerts'],
            ['wearables', 'Wearable Telemetry Stream'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDashView(id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dashView === id
                  ? 'bg-accent-gold text-navy-950 font-black shadow-md'
                  : 'text-olive-300 hover:text-white hover:bg-olive-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2 text-[11px] font-mono text-olive-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Live Stream: <strong>{lastSyncTime}</strong></span>
        </div>
      </div>

      {/* Top Stat Cards */}
      {(dashView === 'overview' || dashView === 'wearables') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-olive-400/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-olive-300 uppercase tracking-wider">
                {role === 'commander' && 'Battalion Readiness Index'}
                {role === 'welfare_officer' && 'Clinical Fatigue Flag Count'}
                {role === 'personnel' && 'My Personal Recovery Score'}
                {role === 'analyst' && '14-Day Forecast Accuracy'}
              </span>
              <div className="p-2 rounded-xl bg-accent-gold/20 text-accent-gold">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {role === 'commander' && <CountUp value={liveMetrics.readinessScore} suffix="/100" />}
              {role === 'welfare_officer' && <CountUp value={liveMetrics.fatigueOutposts} suffix=" Personnel" />}
              {role === 'personnel' && <CountUp value={liveMetrics.readinessScore} suffix="/100" />}
              {role === 'analyst' && <CountUp value={94.2} decimals={1} suffix="%" />}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-accent-gold font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {role === 'commander' && '+4.2% Resilience Index'}
                {role === 'welfare_officer' && '2 High Altitude / Leh'}
                {role === 'personnel' && 'Autonomic Parasympathetic Dominance'}
                {role === 'analyst' && 'Cross-Validation AUC 0.94'}
              </span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-olive-400/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-olive-300 uppercase tracking-wider">
                {role === 'commander' && 'Avg Stress Index'}
                {role === 'welfare_officer' && 'Hypoxia SpO2 Alerts'}
                {role === 'personnel' && 'Resting Heart Rate'}
                {role === 'analyst' && 'Differential Privacy (ε)'}
              </span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {role === 'commander' && <CountUp value={liveMetrics.avgStress} decimals={1} suffix="/10" />}
              {role === 'welfare_officer' && <CountUp value={3} suffix=" Jawans" />}
              {role === 'personnel' && <CountUp value={liveMetrics.heartRate} suffix=" BPM" />}
              {role === 'analyst' && <span>ε = 0.5</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-300 font-mono">
              <span>
                {role === 'commander' && 'Moderate Operational Tempo'}
                {role === 'welfare_officer' && 'Oxygen recovery protocol queued'}
                {role === 'personnel' && 'Normative athletic baseline'}
                {role === 'analyst' && 'k=5 Differential Anonymity'}
              </span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-rose-500/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                {role === 'commander' && 'Fatigue Outpost Flags'}
                {role === 'welfare_officer' && 'Active Counseling Consults'}
                {role === 'personnel' && 'Nocturnal SpO2 Avg'}
                {role === 'analyst' && 'Shift-Stress Correlation'}
              </span>
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {role === 'commander' && <CountUp value={liveMetrics.fatigueOutposts} suffix=" Outposts" />}
              {role === 'welfare_officer' && <CountUp value={18} suffix=" Sessions" />}
              {role === 'personnel' && <CountUp value={liveMetrics.spo2} decimals={1} suffix="%" />}
              {role === 'analyst' && <span>r = 0.81</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-mono">
              <span>
                {role === 'commander' && 'High shift load / Leh Sector'}
                {role === 'welfare_officer' && 'Tele-MANAS confidential link'}
                {role === 'personnel' && 'Optimal Blood Oxygenation'}
                {role === 'analyst' && 'Strong positive correlation'}
              </span>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="glass-panel p-5 rounded-2xl border border-olive-400/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-olive-300 uppercase tracking-wider">
                {role === 'commander' && 'Pending Rest Authorizations'}
                {role === 'welfare_officer' && 'Recovery Respite Prescribed'}
                {role === 'personnel' && 'Sleep Architecture'}
                {role === 'analyst' && 'Ingested Telemetry Rows'}
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {role === 'commander' && <CountUp value={3} suffix=" Requests" />}
              {role === 'welfare_officer' && <CountUp value={9} suffix=" Prescriptions" />}
              {role === 'personnel' && <CountUp value={liveMetrics.sleepHours} decimals={1} suffix=" Hrs" />}
              {role === 'analyst' && <CountUp value={18420} suffix=" Rows" />}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-cyan-300 font-mono">
              <span>
                {role === 'commander' && '48h rotation queue ready'}
                {role === 'welfare_officer' && 'Protected doctor privilege'}
                {role === 'personnel' && 'Deep sleep + REM 82%'}
                {role === 'analyst' && 'Standardized CAPF multi-sensor'}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Centerpiece: 3D Orb + 5D Radar + Unit Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Stress Centerpiece (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                {role === 'personnel' && 'Personal Autonomic Bio-Sphere (Live Wearable)'}
                {role === 'analyst' && 'Multi-Variate 14-Day Stress Regression Model'}
                {role === 'welfare_officer' && 'Autonomic Tone & Clinical Strain Monitor'}
                {role === 'commander' && '3D Battalion Stress Resonance Centerpiece'}
              </h2>
              <p className="text-xs text-olive-300">
                {role === 'personnel' && 'Real-time physiological balance computed from continuous PPG heart rate variability.'}
                {role === 'analyst' && 'Cross-sensor machine learning model correlating shift hours, sleep deficit & altitude.'}
                {role === 'welfare_officer' && 'Sympathetic over-arousal vs parasympathetic recovery curves across units.'}
                {role === 'commander' && 'Visualizing physiological turbulence and sympathetic tone across deployed units.'}
              </p>
            </div>
            <span className="text-xs font-mono text-accent-gold font-bold">
              {role === 'personnel' ? `HRV: ${liveMetrics.hrv} ms` : `Index: ${liveMetrics.avgStress}/10`}
            </span>
          </div>

          <div className="my-4 p-4 rounded-xl bg-olive-900/60 border border-olive-700/40">
            <p className="text-xs text-olive-300 text-center">Stress Level: <strong className="text-accent-gold">{liveMetrics.avgStress}/10</strong></p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-olive-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-olive-900/60 border border-olive-700/50">
              <span className="text-[10px] text-olive-400 block font-mono">
                {role === 'personnel' ? 'Blood Oxygen (SpO2)' : 'Physical Strain'}
              </span>
              <strong className="text-amber-300">
                {role === 'personnel' ? '97.4%' : 'Moderate (54%)'}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-olive-900/60 border border-olive-700/50">
              <span className="text-[10px] text-olive-400 block font-mono">
                {role === 'personnel' ? 'Recovery State' : 'Rest Allocation'}
              </span>
              <strong className="text-emerald-400">
                {role === 'personnel' ? '86% Restored' : 'Stable (78%)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Role-Specific Chart */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">
              {role === 'personnel' && 'My 7-Day Sleep & Recovery Timeline'}
              {role === 'analyst' && 'Outpost Stress vs Workload Regression'}
              {role === 'welfare_officer' && 'Clinical Resilience Vectors'}
              {role === 'commander' && 'Battalion Resilience Dimensions'}
            </h2>
            <span className="text-xs font-mono text-accent-gold">
              {role === 'personnel' ? 'Smartwatch' : 'Normalized'}
            </span>
          </div>

          <p className="text-xs text-olive-300 mb-2">
            {role === 'personnel' && 'Continuous nocturnal sleep duration and autonomic recovery score.'}
            {role === 'analyst' && 'Multi-variate correlation of shift hours vs recorded fatigue.'}
            {role === 'welfare_officer' && '5 key pillars of operational stamina and psychological safety.'}
            {role === 'commander' && '5 key pillars of operational stamina across active battalions.'}
          </p>

          {role === 'personnel' ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={personal7DayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="persRecoveryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="persHrvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" opacity={0.4} />
                  <XAxis dataKey="day" stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
                  <YAxis stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1a14',
                      borderColor: '#d4af37',
                      borderRadius: '16px',
                      color: '#f8fafc',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="recovery"
                    name="Recovery Score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#persRecoveryGrad)"
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hrv"
                    name="HRV (ms)"
                    stroke="#d4af37"
                    strokeWidth={2.5}
                    fill="url(#persHrvGrad)"
                    dot={{ fill: '#d4af37', r: 3 }}
                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2d4a3e" />
                  <PolarAngleAxis dataKey="dimension" stroke="#b4c7a9" tick={{ fontSize: 10, fill: '#b4c7a9' }} />
                  <PolarRadiusAxis stroke="#6f8e5f" angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#6f8e5f' }} />
                  <Radar name="Score" dataKey="score" stroke="#d4af37" fill="#d4af37" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-1.5 pt-3 border-t border-olive-800 text-xs font-mono">
            {visibleUnitStats.map((u) => (
              <div key={u.name} className="flex items-center justify-between text-olive-200">
                <span>{u.name}</span>
                <span className="font-mono text-accent-gold font-bold">{u.wellness} W-Score</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Duty Schedules vs Rest Rotations & Welfare Officers Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Duty Schedule & Leave Trend Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-olive-400/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-gold" />
              <h3 className="text-base font-bold text-white">
                {role === 'personnel' ? 'My duty and recovery rhythm' : 'Weekly Duty Schedules vs Rest Rotations'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-accent-gold">Roster Optimization</span>
          </div>
          <p className="text-xs text-olive-300 mb-4">
            {role === 'personnel'
              ? 'Your personal recovery pattern is visible only to you.'
              : 'Monitoring active duty hours vs scheduled wellness recharge respite.'}
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleDutyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dutyActiveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="dutyRestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" opacity={0.4} />
                <XAxis dataKey="day" stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
                <YAxis stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1a14',
                    borderColor: '#d4af37',
                    borderRadius: '16px',
                    color: '#f8fafc',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="activeDuty"
                  name="Active Duty Load"
                  stroke="#d4af37"
                  strokeWidth={2.5}
                  fill="url(#dutyActiveGrad)"
                  dot={{ fill: '#d4af37', r: 3 }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="restRotation"
                  name="Rest / Recharge Leave"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#dutyRestGrad)"
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Welfare Officers Alerts Section (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-accent-gold" />
              <h3 className="text-base font-bold text-white">
                {role === 'personnel' ? 'My private wellness notice' : 'Welfare Officer Intel Stream'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-accent-gold">Automated AI Trigger</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {visibleWelfareAlerts.map((al) => (
              <div
                key={al.id}
                className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  al.type === 'critical'
                    ? 'bg-rose-950/40 border-rose-500/40 text-slate-100'
                    : 'bg-olive-900/70 border-olive-700/60 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-accent-gold">
                    {al.type === 'critical' ? '🚨' : '⚠️'} {al.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">{al.timeAgo}</span>
                </div>
                <div className="text-[10px] font-mono text-olive-300">{al.unit}</div>
                <p className="text-[11px] text-slate-300">{al.msg}</p>
                <div className="pt-1 text-[10px] font-mono text-accent-gold flex items-center justify-between">
                  <span>Action: {al.action}</span>
                  <button
                    onClick={() => onNavigate(role === 'personnel' ? 'assessment' : 'interventions')}
                    className="px-2 py-0.5 rounded bg-accent-gold/20 hover:bg-accent-gold hover:text-navy-950 text-accent-gold font-bold transition-all"
                  >
                    {role === 'personnel' ? 'Open My Check-In' : 'Act Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
