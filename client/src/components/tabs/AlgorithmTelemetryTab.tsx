import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, Brain, BarChart3 } from 'lucide-react';

export const AlgorithmTelemetryTab: React.FC = () => {
  const metrics = [
    { label: 'ROC-AUC Score', value: 94.2, change: +0.3, status: 'optimal' },
    { label: 'False Positive Rate', value: 4.8, change: -0.2, status: 'optimal' },
    { label: 'False Negative Rate', value: 3.1, change: +0.1, status: 'warning' },
    { label: 'Precision', value: 91.5, change: +0.5, status: 'optimal' },
    { label: 'Recall', value: 88.3, change: -0.3, status: 'warning' },
    { label: 'F1 Score', value: 89.8, change: +0.1, status: 'optimal' },
  ];

  const featureImportance = [
    { feature: 'Sleep Deficit Hours', importance: 0.28 },
    { feature: 'Consecutive Patrol Days', importance: 0.22 },
    { feature: 'HRV Parasympathetic Index', importance: 0.18 },
    { feature: 'Altitude Elevation Flag', importance: 0.15 },
    { feature: 'Shift Hours / Week', importance: 0.10 },
    { feature: 'SpO2 Nocturnal Average', importance: 0.07 },
  ];

  const modelDrift = [
    { day: 'Mon', score: 93.8 },
    { day: 'Tue', score: 94.1 },
    { day: 'Wed', score: 93.5 },
    { day: 'Thu', score: 94.2 },
    { day: 'Fri', score: 94.0 },
    { day: 'Sat', score: 94.2 },
    { day: 'Sun', score: 94.2 },
  ];

  const maxDrift = Math.max(...modelDrift.map(d => d.score));
  const minDrift = Math.min(...modelDrift.map(d => d.score));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-900 to-cyan-950 border border-cyan-500/40 shadow-lg">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Algorithm Telemetry</h2>
          <p className="text-xs text-olive-300 font-mono">Model accuracy monitoring, false positives/negatives & feature importance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="p-4 rounded-2xl bg-olive-900/50 border border-olive-700/50">
            <div className="text-xs text-olive-400 font-mono mb-1">{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-white">{metric.value}{metric.label.includes('Rate') ? '%' : ''}</div>
              <div className={`flex items-center gap-1 text-xs font-mono ${
                metric.change > 0 ? 'text-emerald-400' : metric.change < 0 ? 'text-rose-400' : 'text-olive-400'
              }`}>
                {metric.change > 0 ? <TrendingUp className="w-3 h-3" /> : metric.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-gold" />
              Feature Importance (SHAP Values)
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {featureImportance.map((item) => (
              <div key={item.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-olive-200">{item.feature}</span>
                  <span className="text-xs font-mono text-accent-gold">{(item.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-olive-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.importance * 100}%` }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-gold to-accent-saffron"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-gold" />
              ROC-AUC Drift (7-Day)
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-end justify-between h-32 gap-2">
              {modelDrift.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-mono text-accent-gold">{d.score.toFixed(1)}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${((d.score - minDrift) / (maxDrift - minDrift || 1)) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className={`w-full rounded-t-lg ${
                      d.score >= 94 ? 'bg-emerald-500' : d.score >= 93 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                  <div className="text-[10px] text-olive-400 font-mono">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent-gold" />
          Model Performance Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-olive-900/50 border border-olive-800 text-center">
            <div className="text-lg font-black text-white">36</div>
            <div className="text-[10px] text-olive-400 font-mono">Trees in Ensemble</div>
          </div>
          <div className="p-3 rounded-xl bg-olive-900/50 border border-olive-800 text-center">
            <div className="text-lg font-black text-white">0.946</div>
            <div className="text-[10px] text-olive-400 font-mono">10-Fold CV ROC-AUC</div>
          </div>
          <div className="p-3 rounded-xl bg-olive-900/50 border border-olive-800 text-center">
            <div className="text-lg font-black text-white">12</div>
            <div className="text-[10px] text-olive-400 font-mono">Feature Vector Size</div>
          </div>
          <div className="p-3 rounded-xl bg-olive-900/50 border border-olive-800 text-center">
            <div className="text-lg font-black text-white">0.85</div>
            <div className="text-[10px] text-olive-400 font-mono">Privacy Budget (ε)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
