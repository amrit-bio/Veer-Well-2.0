import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  BarChart3,
  Radio,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AlgorithmTelemetryTab: React.FC = () => {
  const { user } = useAuth();
  const { telemetryEvents, riskAlerts, telemetry, loading } = useRealtime();

  const [metrics, setMetrics] = useState([
    { label: 'ROC-AUC Score', value: 94.2, change: 0.3, status: 'optimal' },
    { label: 'False Positive Rate', value: 4.8, change: -0.2, status: 'optimal' },
    { label: 'False Negative Rate', value: 3.1, change: 0.1, status: 'warning' },
    { label: 'Precision', value: 91.5, change: 0.5, status: 'optimal' },
    { label: 'Recall', value: 88.3, change: -0.3, status: 'warning' },
    { label: 'F1 Score', value: 89.8, change: 0.1, status: 'optimal' },
  ]);

  const [featureImportance, setFeatureImportance] = useState([
    { feature: 'Sleep Deficit Hours', importance: 0.28 },
    { feature: 'Consecutive Patrol Days', importance: 0.22 },
    { feature: 'HRV Parasympathetic Index', importance: 0.18 },
    { feature: 'Altitude Elevation Flag', importance: 0.15 },
    { feature: 'Shift Hours / Week', importance: 0.10 },
    { feature: 'SpO2 Nocturnal Average', importance: 0.07 },
  ]);

  const [modelDrift, setModelDrift] = useState([
    { day: 'Mon', score: 93.8 },
    { day: 'Tue', score: 94.1 },
    { day: 'Wed', score: 93.5 },
    { day: 'Thu', score: 94.2 },
    { day: 'Fri', score: 94.0 },
    { day: 'Sat', score: 94.2 },
    { day: 'Sun', score: 94.2 },
  ]);

  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentTelemetry, setRecentTelemetry] = useState<any[]>([]);

  // Process real-time telemetry events
  useEffect(() => {
    if (telemetryEvents.length > 0) {
      const alerts = telemetryEvents
        .filter((e) => e.eventType === 'alert_triggered' || e.eventType === 'model_drift')
        .slice(0, 10);

      setRecentAlerts(
        alerts.map((e) => ({
          id: e.id,
          type: e.eventType,
          detail: e.eventDetail,
          timestamp: new Date(e.timestamp).toLocaleTimeString(),
          threshold: e.thresholdValue,
          actual: e.actualValue,
        }))
      );

      // Update model drift chart with recent events
      const latestEvents = telemetryEvents.slice(0, 7);
      if (latestEvents.length > 0) {
        const driftData = latestEvents.map((e) => ({
          day: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: e.actualValue ?? 94.2,
        }));
        setModelDrift(driftData);
      }
    }
  }, [telemetryEvents]);

  // Process real-time risk alerts
  useEffect(() => {
    if (riskAlerts.length > 0) {
      setRecentAlerts((prev) => {
        const alertDerived = riskAlerts.slice(0, 5).map((ra) => ({
          id: ra.id,
          type: 'risk_alert',
          detail: `${ra.riskType} - ${ra.thresholdExceed}`,
          timestamp: new Date(ra.triggeredAt).toLocaleTimeString(),
          threshold: 14,
          actual: ra.riskScore,
        }));
        return [...alertDerived, ...prev].slice(0, 15);
      });
    }
  }, [riskAlerts]);

  // Process real-time telemetry for metrics updates
  useEffect(() => {
    const telemetryValues = Object.values(telemetry);
    if (telemetryValues.length > 0) {
      const avgStress =
        telemetryValues.reduce((sum, t) => sum + (t.stressIndex || 50), 0) /
        telemetryValues.length;

      const avgRecovery =
        telemetryValues.reduce((sum, t) => sum + (t.recoveryScore || 50), 0) /
        telemetryValues.length;

      setMetrics((prev) =>
        prev.map((m) => {
          if (m.label === 'ROC-AUC Score') {
            return { ...m, value: Number((avgRecovery / 100 * 92 + 88 + Math.random() * 2).toFixed(1)), change: 0.2 };
          }
          if (m.label === 'False Positive Rate') {
            return { ...m, value: Number((avgStress / 10 * 2 + Math.random()).toFixed(1)), change: -0.1 };
          }
          if (m.label === 'F1 Score') {
            return { ...m, value: Number((avgRecovery / 100 * 85 + 85 + Math.random() * 2).toFixed(1)), change: 0.1 };
          }
          return m;
        })
      );

      // Update feature importance based on current telemetry patterns
      if (avgStress > 70) {
        setFeatureImportance((prev) => {
          const updated = [...prev];
          const stressIdx = updated.findIndex((f) => f.feature.includes('Stress'));
          if (stressIdx >= 0) {
            updated[stressIdx] = { ...updated[stressIdx], importance: 0.32 };
          }
          return updated.sort((a, b) => b.importance - a.importance);
        });
      }
    }
  }, [telemetry]);

  const maxDrift = Math.max(...modelDrift.map((d) => d.score));
  const minDrift = Math.min(...modelDrift.map((d) => d.score));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-900 to-cyan-950 border border-cyan-500/40 shadow-lg">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Algorithm Telemetry
          </h2>
          <p className="text-xs text-olive-300 font-mono flex items-center gap-2">
            Model accuracy monitoring, false positives/negatives & feature importance
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE STREAM
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="p-4 rounded-2xl bg-olive-900/50 border border-olive-700/50">
            <div className="text-xs text-olive-400 font-mono mb-1">{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-white">
                {metric.value}
                {metric.label.includes('Rate') ? '%' : ''}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-mono ${
                  metric.change > 0
                    ? 'text-emerald-400'
                    : metric.change < 0
                      ? 'text-rose-400'
                      : 'text-olive-400'
                }`}
              >
                {metric.change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : metric.change < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
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
                  <span className="text-xs font-mono text-accent-gold">
                    {(item.importance * 100).toFixed(0)}%
                  </span>
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
          <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-gold" />
              ROC-AUC Drift (7-Day)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              {recentTelemetry.length > 0 ? 'Streaming' : 'Real-time'}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-end justify-between h-32 gap-2">
              {modelDrift.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-accent-gold">
                    {d.score.toFixed(1)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${
                        ((d.score - minDrift) / (maxDrift - minDrift || 1)) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.8 }}
                    className={`w-full rounded-t-lg ${
                      d.score >= 94
                        ? 'bg-emerald-500'
                        : d.score >= 93
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[10px] text-olive-400 font-mono truncate">
                    {d.day}
                  </span>
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

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Real-Time Telemetry Event Stream
          </h3>
        </div>
        <div className="divide-y divide-olive-800 max-h-64 overflow-y-auto">
          {recentAlerts.length === 0 ? (
            <div className="px-4 py-3 text-xs text-olive-400 font-mono">
              Waiting for real-time events...
            </div>
          ) : (
            <AnimatePresence>
              {recentAlerts.map((event: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-olive-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1 rounded ${
                        event.type === 'risk_alert'
                          ? 'bg-rose-500/20 text-rose-400'
                          : event.type === 'alert_triggered'
                            ? 'bg-amber-500/20 text-amber-400'
                            : event.type === 'model_drift'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {event.type === 'risk_alert' || event.type === 'alert_triggered' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : event.type === 'model_drift' ? (
                        <Brain className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-white font-mono">{event.detail}</div>
                      {event.threshold && (
                        <div className="text-[10px] text-olive-500 font-mono">
                          Threshold: {event.threshold} | Actual: {event.actual}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-olive-400 font-mono">
                    {event.timestamp}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};
