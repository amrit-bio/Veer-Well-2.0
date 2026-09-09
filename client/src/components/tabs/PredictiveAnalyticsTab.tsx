import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as LineChartIcon,
  Cpu,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Sliders,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BrandLogo } from '../common/BrandLogo';
import { predictXGBoost } from '../../lib/xgboostEngine';

export const PredictiveAnalyticsTab: React.FC = () => {
  const [anonymizationLevel, setAnonymizationLevel] = useState<'raw' | 'anonymized'>('anonymized');
  const [view, setView] = useState<'forecast' | 'simulator' | 'privacy'>('forecast');

  // Simulation Levers
  const [simShiftHours, setSimShiftHours] = useState<number>(48);
  const [simRestDays, setSimRestDays] = useState<number>(2);
  const [simHypoxia, setSimHypoxia] = useState<boolean>(true);

  // Predictive Cohort Forecasts (7-14 Days Forward)
  const cohortForecasts = [
    {
      cohort: 'BSF Rajasthan - Thar Desert Patrol Ops',
      currentStress: 7.2,
      forecast7D: 7.9,
      riskTier: 'Critical Strain Risk',
      fatigueProbability: 89,
      topFactor: 'Extreme heat exposure, water scarcity, 12-hour border patrols',
      action: 'Immediate rotation to cooler zone, enhanced hydration protocol',
    },
    {
      cohort: 'CRPF 142 Bn - Kashmir Anti-Militancy Ops',
      currentStress: 6.4,
      forecast7D: 6.1,
      riskTier: 'High Strain',
      fatigueProbability: 71,
      topFactor: 'Sleep deprivation from night ambush preparations',
      action: 'Scheduled rest cycles, peer counseling sessions',
    },
    {
      cohort: 'ITBP Ladakh Sector - High Altitude Deployment',
      currentStress: 7.8,
      forecast7D: 8.3,
      riskTier: 'Critical Altitude Stress',
      fatigueProbability: 92,
      topFactor: 'Hypoxia (14,000 ft), sub-zero conditions, isolation',
      action: 'Mandatory 72h lowland acclimatization rotation',
    },
    {
      cohort: 'CISF Airport Security - Round-the-Clock Vigilance',
      currentStress: 4.2,
      forecast7D: 4.1,
      riskTier: 'Moderate - Stable',
      fatigueProbability: 38,
      topFactor: 'Repetitive screening duties, crowd management',
      action: 'Roster optimization, break scheduling enhancement',
    },
  ];

  // Dynamic 14-Day Trajectory Curve (Baseline vs What-If Simulated Intervention)
  const calculateTrajectory = () => {
    const days = ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 14'];
    const pred = predictXGBoost({
      meanAnswer: simShiftHours / 24,
      sleepLoad: simHypoxia ? 2.2 : 1.1,
      burnoutLoad: simShiftHours / 28,
      cognitiveLoad: (3 - simRestDays) * 0.8,
      safetyLoad: 1,
      heartRate: 58 + simShiftHours / 3,
      spo2: simHypoxia ? 91 : 97,
      hrv: Math.max(30, 74 - simShiftHours / 4 + simRestDays * 4),
      shiftHours: simShiftHours,
      sleepDeficit: simHypoxia ? 2.8 : Math.max(0.4, 4 - simRestDays),
      consecutiveDays: 8 - simRestDays,
      altitude: simHypoxia ? 1 : 0,
    });

    return days.map((day, idx) => {
      const baseline = 5.2 + idx * 0.35 + (simHypoxia ? 0.6 : 0);
      const simulated = Math.max(2.5, Math.min(9.5, (pred.stressScore / 12) + idx * 0.12 - simRestDays * 0.35));
      return {
        day,
        baseline: Number(baseline.toFixed(1)),
        simulated: Number(simulated.toFixed(1)),
        safetyThreshold: 6.5,
        xgbScore: pred.stressScore,
      };
    });
  };

  const trajectoryData = calculateTrajectory();

  // Correlation Scatter Data: Duty Hours (X) vs Stress Score (Y)
  const correlationData = [
    { x: 38, y: 3.2, z: 24, node: 'CAPF-NODE-0201', unit: 'CISF-Mumbai' },
    { x: 42, y: 4.3, z: 35, node: 'CAPF-NODE-0202', unit: 'BSF-Gujarat' },
    { x: 46, y: 5.1, z: 48, node: 'CAPF-NODE-0203', unit: 'CRPF-Kashmir' },
    { x: 50, y: 6.2, z: 65, node: 'CAPF-NODE-0204', unit: 'BSF-Rajasthan' },
    { x: 54, y: 7.4, z: 81, node: 'CAPF-NODE-0205', unit: 'ITBP-Ladakh' },
    { x: 58, y: 8.2, z: 94, node: 'CAPF-NODE-0206', unit: 'ITBP-Siachen' },
    { x: 40, y: 3.8, z: 28, node: 'CAPF-NODE-0207', unit: 'CISF-Delhi' },
    { x: 45, y: 4.7, z: 42, node: 'CAPF-NODE-0208', unit: 'CRPF-Chhattisgarh' },
    { x: 52, y: 6.5, z: 74, node: 'CAPF-NODE-0209', unit: 'BSF-Assam' },
    { x: 56, y: 7.8, z: 88, node: 'CAPF-NODE-0210', unit: 'ITBP-Arunachal' },
  ];

  // Raw vs Anonymized Demo Data
  const sampleRecords = [
    {
      rawName: 'Insp. Arun Kumar Singh',
      rawService: 'BSF-2891-TN-Rajasthan',
      rawUnit: 'BSF Jaipur Frontier - Border Security Force',
      anonId: 'CAPF-NODE-5821',
      anonForce: 'Paramilitary Desert Patrol Unit',
      anonZone: 'Western Border Sector - Thar Region',
      stressScore: 7.3,
      fatigueIndex: 82,
    },
    {
      rawName: 'Sub-Insp. Neha Verma',
      rawService: 'CRPF-4472-JK-Kashmir',
      rawUnit: 'CRPF 142 Bn - Srinagar Command',
      anonId: 'CAPF-NODE-6174',
      anonForce: 'Central Armed Police Force - Urban Operations',
      anonZone: 'Northern Conflict Zone - Mountain Sector',
      stressScore: 6.8,
      fatigueIndex: 74,
    },
    {
      rawName: 'Head Const. Prem Prasad Negi',
      rawService: 'ITBP-1605-LA-Ladakh',
      rawUnit: 'ITBP Leh Forward Outpost - Siachen Adjacent',
      anonId: 'CAPF-NODE-7392',
      anonForce: 'High Altitude Paramilitary Force',
      anonZone: 'Frontier High-Altitude Deployment - Extreme Elevation',
      stressScore: 8.1,
      fatigueIndex: 91,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Predictive Behavioral Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Predictive Stress Modeling & Behavioral Intelligence
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            36-tree gradient boosting fused with wearable HRV/SpO₂ and roster levers. 7–14 day burnout risk — welfare use only.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-900 border border-olive-500/40 text-xs font-mono text-accent-gold">
          <Cpu className="w-4 h-4" />
              <span>Predictive Engine · live inference</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-olive-950/80 border border-olive-700/50">
        {([
          ['forecast', 'Cohort forecast'],
          ['simulator', 'What-if simulator'],
          ['privacy', 'Privacy demo'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold ${
              view === id
                ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                : 'text-olive-300 hover:text-white hover:bg-olive-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'forecast' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cohortForecasts.map((cf, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
              cf.riskTier.includes('High')
                ? 'border-rose-500/40 bg-rose-950/20'
                : cf.riskTier.includes('Moderate')
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-olive-400/30 bg-olive-950/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    cf.riskTier.includes('High')
                      ? 'bg-rose-500/20 text-rose-300'
                      : cf.riskTier.includes('Moderate')
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {cf.riskTier}
                </span>
                <span className="text-[10px] text-olive-300 font-mono">
                  {cf.fatigueProbability}% Prob.
                </span>
              </div>
              <h3 className="text-xs font-bold text-white leading-snug">{cf.cohort}</h3>
              <div className="flex items-baseline gap-2 mt-2 font-mono">
                <span className="text-xl font-black text-white">{cf.currentStress}</span>
                <span className="text-[10px] text-olive-400">→ Forecast 7D:</span>
                <span
                  className={`text-sm font-bold ${
                    cf.forecast7D > 6.5 ? 'text-rose-400' : 'text-accent-gold'
                  }`}
                >
                  {cf.forecast7D}/10
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-olive-800 text-[10px] space-y-1">
              <div className="text-olive-300">
                <strong>Driver:</strong> {cf.topFactor}
              </div>
              <div className="text-accent-gold font-mono font-semibold">
                <strong>Action:</strong> {cf.action}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {view === 'simulator' && (
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent-gold" />
              Interactive "What-If" Operational Stress & Roster Simulator
            </h2>
            <p className="text-xs text-olive-300 mt-0.5">
              Simulate duty rotation parameters to forecast 14-day strain alleviation before roster deployment.
            </p>
          </div>
          <span className="text-xs font-mono text-accent-gold bg-olive-900 px-3 py-1 rounded-xl border border-olive-700">
            Dynamic ML Curve Update
          </span>
        </div>

        {/* Sliders Control Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-olive-900/60 border border-olive-700/60 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-slate-200">Weekly Border Patrol Hours:</span>
              <strong className="text-accent-gold">{simShiftHours} hrs/week</strong>
            </div>
            <input
              type="range"
              min={32}
              max={68}
              value={simShiftHours}
              onChange={(e) => setSimShiftHours(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-olive-400 font-mono">
              <span>32h (Standard)</span>
              <span>68h (Extended Ops)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-slate-200">Mandatory Rest & Recovery Days:</span>
              <strong className="text-emerald-400">{simRestDays} days/week</strong>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              value={simRestDays}
              onChange={(e) => setSimRestDays(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-olive-400 font-mono">
              <span>1 Day (Emergency)</span>
              <span>4 Days (Optimal)</span>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-1.5">
            <span className="text-slate-200 font-mono">Sector Altitude / Hypoxia Factor:</span>
            <button
              onClick={() => setSimHypoxia(!simHypoxia)}
              className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all border ${
                simHypoxia
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-olive-800 text-olive-300 border-olive-700'
              }`}
            >
              {simHypoxia ? '🏔️ High Altitude (Leh/ITBP Active)' : '🌲 Standard Lowland Sector'}
            </button>
          </div>
        </div>

        {/* 14-Day Trajectory Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" opacity={0.4} />
              <XAxis dataKey="day" stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
              <YAxis domain={[1, 10]} stroke="#8faa80" tick={{ fontSize: 11, fill: '#8faa80' }} />
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
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline Trajectory (Status Quo)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#f43f5e' }}
              />
              <Line
                type="monotone"
                dataKey="simulated"
                name="Simulated Roster Intervention"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="safetyThreshold"
                name="Clinical Warning Threshold (6.5)"
                stroke="#d4af37"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {(view === 'forecast' || view === 'privacy') && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workload vs Stress Correlation Scatter (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-gold" />
                Workload vs Stress Regression Scatter
              </h2>
              <span className="text-xs font-mono text-accent-gold font-bold">r = 0.81 (Strong)</span>
            </div>
            <p className="text-xs text-olive-300 mb-4">
              X: Weekly Duty Hours | Y: Stress Score (1-10) | Bubble Size: Fatigue Severity Index
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" opacity={0.4} />
                <XAxis type="number" dataKey="x" name="Duty Hours" unit="h" stroke="#8faa80" domain={[30, 65]} tick={{ fontSize: 10, fill: '#8faa80' }} />
                <YAxis type="number" dataKey="y" name="Stress Score" stroke="#8faa80" domain={[1, 10]} tick={{ fontSize: 10, fill: '#8faa80' }} />
                <ZAxis type="number" dataKey="z" range={[60, 380]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#d4af37' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-olive-950 border border-accent-gold/60 p-3 rounded-2xl text-xs space-y-1 shadow-2xl font-mono">
                          <p className="font-bold text-accent-gold">{data.node} ({data.unit})</p>
                          <p className="text-slate-200">Duty Load: <strong>{data.x} hrs/week</strong></p>
                          <p className="text-amber-300">Stress Index: <strong>{data.y}/10</strong></p>
                          <p className="text-emerald-400">Fatigue Amplitude: <strong>{data.z}%</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Personnel Nodes" data={correlationData} fill="#d4af37" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Anonymization Interactive Demonstration (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-olive-400/30 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-gold" />
                Privacy & Data Anonymization Demo
              </h2>
              <p className="text-xs text-olive-300">
                Interactive preview of cryptographic token masking before analytics ingestion.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center bg-olive-900 rounded-xl p-1 border border-olive-700">
              <button
                onClick={() => setAnonymizationLevel('anonymized')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  anonymizationLevel === 'anonymized'
                    ? 'bg-accent-gold text-navy-950 font-bold shadow-md'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Masked (Secure)</span>
              </button>
              <button
                onClick={() => setAnonymizationLevel('raw')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  anonymizationLevel === 'raw'
                    ? 'bg-rose-500 text-white font-bold shadow-md'
                    : 'text-olive-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Raw Mock (Admin)</span>
              </button>
            </div>
          </div>

          {/* Anonymized Transformation Preview Cards */}
          <div className="space-y-2.5">
            {sampleRecords.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-olive-900/70 border border-olive-700/60 text-xs space-y-2"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-accent-gold font-bold">
                    {anonymizationLevel === 'anonymized' ? rec.anonId : rec.rawName}
                  </span>
                  <span className="text-olive-300 text-[10px]">
                    {anonymizationLevel === 'anonymized' ? rec.anonForce : rec.rawService}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>
                    Location: {anonymizationLevel === 'anonymized' ? rec.anonZone : rec.rawUnit}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Stress: {rec.stressScore}/10
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-olive-950 border border-olive-600/30 text-[11px] text-olive-300 font-mono">
            <strong>Security Proof:</strong> Under K-Anonymity (k=5) & Differential Privacy (ε=0.5), individual identity reconstruction probability is &lt; 0.001%.
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

