import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WearableTelemetry, RiskAlert, UnitHeatmapData, SystemTelemetry, VoiceLog } from '../types';

interface RealtimeContextType {
  // Raw real-time streams
  telemetry: Record<string, WearableTelemetry>;
  riskAlerts: RiskAlert[];
  heatmapData: UnitHeatmapData[];
  telemetryEvents: SystemTelemetry[];
  voiceLogs: VoiceLog[];

  // Derived state
  loading: boolean;
  error: string | null;

  // Manual actions
  acknowledgeRiskAlert: (alertId: string, acknowledgedBy: string) => Promise<void>;
  subscribeToUnit: (unit: string) => void;
  unsubscribeFromUnit: (unit: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = (): RealtimeContextType => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within a RealtimeProvider');
  return ctx;
};

interface RealtimeProviderProps {
  children: ReactNode;
  userId?: string;
  unit?: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
  userId,
  unit,
}) => {
  const [telemetry, setTelemetry] = useState<Record<string, WearableTelemetry>>({});
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [heatmapData, setHeatmapData] = useState<UnitHeatmapData[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<SystemTelemetry[]>([]);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionsRef = React.useRef<Map<string, any>>(new Map());
  const unsubscribedUnitsRef = React.useRef<Set<string>>(new Set());

  const subscribeToUnit = (unitName: string) => {
    unsubscribedUnitsRef.current.delete(unitName);
  };

  const unsubscribeFromUnit = (unitName: string) => {
    unsubscribedUnitsRef.current.add(unitName);
  };

  const acknowledgeRiskAlert = async (alertId: string, acknowledgedBy: string) => {
    try {
      const { error: updateError } = await supabase
        .from('risk_alerts')
        .update({ acknowledged: true, acknowledgedBy })
        .eq('id', alertId);

      if (updateError) throw updateError;

      // Emit telemetry event
      await supabase.from('system_telemetry').insert({
        eventType: 'alert_acknowledged',
        eventDetail: `Risk alert ${alertId} acknowledged by ${acknowledgedBy}`,
        triggeredBy: acknowledgedBy,
        thresholdValue: null,
        actualValue: null,
        timestamp: new Date().toISOString(),
      });

      setRiskAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true, acknowledgedBy } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      setError('Failed to acknowledge alert');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channels: any[] = [];

    // ─── Wearable Telemetry Stream ───────────────────────────────────────────
    if (userId) {
      const telemetryChannel = supabase
        .channel(`wearable:telemetry:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wearable_telemetry',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const data = payload.new as WearableTelemetry & { user_id?: string; timestamp?: string };
            setTelemetry((prev) => ({
              ...prev,
              [data.user_id || 'current']: {
                date: data.date,
                heartRate: data.heartRate,
                hrv: data.hrv,
                spo2: data.spo2,
                steps: data.steps,
                sleepHours: data.sleepHours,
                sleepQuality: data.sleepQuality,
                stressIndex: data.stressIndex,
                recoveryScore: data.recoveryScore,
              },
            }));
          }
        )
        .subscribe();
      channels.push(telemetryChannel);
    }

    // Also listen for anonymous telemetry aggregates (commander view)
    const aggregateTelemetryChannel = supabase
      .channel('wearable:telemetry:aggregate')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wearable_telemetry',
        },
        (payload) => {
          const data = payload.new as WearableTelemetry & { user_id?: string; unit?: string };
          const userUnit = data.unit || '';
          if (userUnit && !unsubscribedUnitsRef.current.has(userUnit)) {
            setTelemetry((prev) => ({
              ...prev,
              [data.user_id || `unit-${userUnit}`]: {
                date: data.date,
                heartRate: data.heartRate,
                hrv: data.hrv,
                spo2: data.spo2,
                steps: data.steps,
                sleepHours: data.sleepHours,
                sleepQuality: data.sleepQuality,
                stressIndex: data.stressIndex,
                recoveryScore: data.recoveryScore,
              },
            }));
          }
        }
      )
      .subscribe();
    channels.push(aggregateTelemetryChannel);

    // ─── Risk Alerts Stream ──────────────────────────────────────────────────
    const alertsChannel = supabase
      .channel('risk:alerts:all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'risk_alerts',
        },
        (payload) => {
          const alert = payload.new as RiskAlert;
          if (payload.eventType === 'INSERT') {
            setRiskAlerts((prev) => [alert, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRiskAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setRiskAlerts((prev) => prev.filter((a) => a.id !== alert.id));
          }
        }
      )
      .subscribe();
    channels.push(alertsChannel);

    // ─── Heatmap Aggregates Stream ───────────────────────────────────────────
    const heatmapChannel = supabase
      .channel('heatmap:unit_aggregates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unit_heatmap',
        },
        (payload) => {
          const data = payload.new as UnitHeatmapData & { unit?: string };
          if (payload.eventType === 'INSERT') {
            setHeatmapData((prev) => {
              const filtered = prev.filter((h) => h.unit !== data.unit);
              return [data as UnitHeatmapData, ...filtered];
            });
          } else if (payload.eventType === 'UPDATE') {
            setHeatmapData((prev) =>
              prev.map((h) => (h.unit === data.unit ? (data as UnitHeatmapData) : h))
            );
          }
        }
      )
      .subscribe();
    channels.push(heatmapChannel);

    // ─── System Telemetry Stream ─────────────────────────────────────────────
    const telemetryEventsChannel = supabase
      .channel('system:telemetry:events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_telemetry',
        },
        (payload) => {
          const evt = payload.new as SystemTelemetry;
          setTelemetryEvents((prev) => [evt, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();
    channels.push(telemetryEventsChannel);

    // ─── Voice Logs Stream ───────────────────────────────────────────────────
    const voiceLogChannel = supabase
      .channel('voice:logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_logs',
        },
        (payload) => {
          const log = payload.new as VoiceLog & { user_id?: string; unit?: string; location?: string };
          setVoiceLogs((prev) => [log as VoiceLog, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();
    channels.push(voiceLogChannel);

    // ─── Assessments Stream (PHQ-9 triggers) ─────────────────────────────────
    const assessmentsChannel = supabase
      .channel('assessments:phq9')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assessments',
        },
        (payload) => {
          const assessment = payload.new as {
            user_id: string;
            score: number;
            phq9_score?: number;
            unit?: string;
            location?: string;
            timestamp?: string;
          };

          const score = assessment.phq9_score ?? assessment.score ?? 0;

          // Only emit telemetry for significant events
          if (score > 0) {
            const event: SystemTelemetry = {
              id: `assess-${assessment.user_id}-${Date.now()}`,
              eventType: 'model_drift',
              eventDetail: `PHQ-9 assessment received: score ${score}`,
              triggeredBy: assessment.user_id,
              thresholdValue: 14,
              actualValue: score,
              timestamp: assessment.timestamp || new Date().toISOString(),
            };
            setTelemetryEvents((prev) => [event, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();
    channels.push(assessmentsChannel);

    setLoading(false);

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [userId, unit]);

  return (
    <RealtimeContext.Provider
      value={{
        telemetry,
        riskAlerts,
        heatmapData,
        telemetryEvents,
        voiceLogs,
        loading,
        error,
        acknowledgeRiskAlert,
        subscribeToUnit,
        unsubscribeFromUnit,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};
