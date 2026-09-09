/**
 * वीरWell (Rakshak AI) — Formal State Machine Integration Hook
 * 
 * This hook bridges the existing RealtimeContext with the formal state machine,
 * providing invariant-verified state management for the clinical dashboard.
 * 
 * It wraps the existing real-time data streams and ensures all state transitions
 * pass through the formal state machine with invariant checks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import {
  StateMachine,
  AlertState,
  MedicalOfficerContext,
  PersonnelTelemetry,
  createMedicalOfficerContext,
  createInitialAlertState,
  calculateCompositeRiskScore,
  AcknowledgeResult,
  ResolveResult,
  SyncTelemetryResult,
  InterventionType,
} from '../formal';
import { rakshakAI } from '../formal/aiIntegration';

// ─── Integration State ───────────────────────────────────────────────────────

interface FormalAlertStore {
  alerts: Map<string, AlertState>;
  addAlert(nodeId: string, alert: AlertState): void;
  getAlert(nodeId: string): AlertState | undefined;
  updateAlert(nodeId: string, updater: (alert: AlertState) => AlertState): void;
  getAllAlerts(): AlertState[];
  clear(): void;
}

function createFormalAlertStore(): FormalAlertStore {
  const alerts = new Map<string, AlertState>();

  return {
    alerts,
    addAlert(nodeId: string, alert: AlertState): void {
      alerts.set(nodeId, alert);
    },
    getAlert(nodeId: string): AlertState | undefined {
      return alerts.get(nodeId);
    },
    updateAlert(nodeId: string, updater: (alert: AlertState) => AlertState): void {
      const current = alerts.get(nodeId);
      if (current) {
        alerts.set(nodeId, updater(current));
      }
    },
    getAllAlerts(): AlertState[] {
      return Array.from(alerts.values());
    },
    clear(): void {
      alerts.clear();
    },
  };
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

export interface UseFormalStateMachineReturn {
  // State
  alerts: AlertState[];
  criticalCount: number;
  pendingCount: number;
  resolvedCount: number;
  activeInterventionCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  syncTelemetry: (nodeId: string, telemetry: PersonnelTelemetry) => Promise<SyncTelemetryResult>;
  acknowledgeAlert: (nodeId: string, officer: MedicalOfficerContext) => Promise<AcknowledgeResult>;
  resolveIntervention: (
    nodeId: string,
    interventionId: string,
    officer: MedicalOfficerContext,
    notes?: string
  ) => Promise<ResolveResult>;
  getAIRecommendations: (nodeId: string, availableInterventions: InterventionType[]) => Promise<any[]>;
  getClinicalSummary: (nodeId: string) => Promise<any>;

  // Utilities
  getAlert: (nodeId: string) => AlertState | undefined;
  refreshAlerts: () => void;
}

// ─── Hook Implementation ─────────────────────────────────────────────────────

export function useFormalStateMachine(): UseFormalStateMachineReturn {
  const { user } = useAuth();
  const { riskAlerts, telemetry, acknowledgeRiskAlert, loading: realtimeLoading, error: realtimeError } = useRealtime();

  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<string[]>([]);

  // Formal alert store (persists across renders)
  const storeRef = useRef<FormalAlertStore>(createFormalAlertStore());
  const officerContextRef = useRef<MedicalOfficerContext | null>(null);

  // Initialize officer context from auth
  useEffect(() => {
    if (user && !officerContextRef.current) {
      officerContextRef.current = createMedicalOfficerContext({
        officerId: user.id,
        postId: user.unit,
        battalionId: user.unit,
        force: user.force,
        authorizationLevel: getAuthLevel(user.role),
        jurisdictionBounds: [user.unit],
        certifications: ['Medical Officer', 'Clinical Psychology'],
      });
    }
  }, [user]);

  // Sync real-time risk alerts into formal state machine
  useEffect(() => {
    if (riskAlerts.length === 0) return;

    const newAlerts: AlertState[] = [];

    riskAlerts.forEach((ra) => {
      // Check if we already have this alert in formal store
      const existing = storeRef.current.getAlert(ra.id);
      if (!existing) {
        // Create new formal alert state from real-time data
        const telemetryData: PersonnelTelemetry = {
          nodeId: ra.id,
          postId: ra.unit,
          timestamp: ra.triggeredAt,
          heartRate: 72, // Default, would come from telemetry stream
          hrv: 50,
          spo2: 97,
          sleepHours: 6,
          sleepQuality: 60,
          stressIndex: ra.riskScore,
          recoveryScore: 50,
          consecutiveShifts: 3,
          altitudeExposure: false,
          hypoxiaLevel: 0,
        };

        const alertState = createInitialAlertState(ra.id, ra.unit, telemetryData);
        storeRef.current.addAlert(ra.id, alertState);
        newAlerts.push(alertState);
      }
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => {
        const combined = [...prev, ...newAlerts];
        // Deduplicate by nodeId
        const unique = new Map(combined.map((a) => [a.nodeId, a]));
        return Array.from(unique.values());
      });
    }
  }, [riskAlerts]);

  // Compute stats
  const criticalCount = alerts.filter((a) => a.status === 'CRITICAL').length;
  const pendingCount = alerts.filter((a) => a.status === 'PENDING_REVIEW').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;
  const activeInterventionCount = alerts.filter((a) => a.status === 'ACTIVE_INTERVENTION').length;

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const syncTelemetry = useCallback(
    async (nodeId: string, telemetryData: PersonnelTelemetry): Promise<SyncTelemetryResult> => {
      try {
        const officer = officerContextRef.current;
        if (!officer) {
          throw new Error('Officer context not initialized');
        }

        // Get or create alert
        let alert = storeRef.current.getAlert(nodeId);
        if (!alert) {
          alert = createInitialAlertState(nodeId, telemetryData.postId, telemetryData);
        }
        const currentAlert = alert;

        // Create state machine and transition
        const sm = new StateMachine(currentAlert, officer);
        const updatedAlert = sm.transition('SYNC_TELEMETRY', {
          telemetry: telemetryData,
          triggeredBy: 'SYSTEM',
        });

        // Update store
        storeRef.current.addAlert(nodeId, updatedAlert);
        setAlerts((prev) => {
          const idx = prev.findIndex((a) => a.nodeId === nodeId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedAlert;
            return next;
          }
          return [...prev, updatedAlert];
        });

        // Get AI prediction
        let aiPrediction;
        if (updatedAlert.compositeRiskScore >= 50) {
          try {
            const prediction = await rakshakAI.predictRisk({
              telemetry: telemetryData,
              historicalTrend: [],
              postContext: {
                postId: telemetryData.postId,
                altitudeExposure: telemetryData.altitudeExposure,
                operationalTempo: updatedAlert.compositeRiskScore >= 80 ? 'CRITICAL' : 'NORMAL',
                availableInterventions: [
                  'Thermal Respite',
                  'Counseling Session',
                  'Rest Rotation',
                  'Medical Check',
                ],
              },
            });
            aiPrediction = {
              breachProbability48h: prediction.thresholdBreachProbability,
              confidence: prediction.confidence,
            };
          } catch (e) {
            console.error('AI prediction failed:', e);
          }
        }

        return {
          success: true,
          alert: updatedAlert,
          previousScore: currentAlert.compositeRiskScore,
          scoreDelta: updatedAlert.compositeRiskScore - currentAlert.compositeRiskScore,
          stateChanged: updatedAlert.status !== currentAlert.status,
          newStatus: updatedAlert.status,
          invariantsPassed: true,
          aiPrediction,
          errors: [],
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          alert: createInitialAlertState(nodeId, '', {
            nodeId,
            postId: '',
            timestamp: new Date().toISOString(),
            heartRate: 0,
            hrv: 0,
            spo2: 0,
            sleepHours: 0,
            sleepQuality: 0,
            stressIndex: 0,
            recoveryScore: 0,
            consecutiveShifts: 0,
            altitudeExposure: false,
            hypoxiaLevel: 0,
          }),
          previousScore: 0,
          scoreDelta: 0,
          stateChanged: false,
          newStatus: 'IDLE',
          invariantsPassed: false,
          errors: [errorMessage],
        };
      }
    },
    []
  );

  const acknowledgeAlert = useCallback(
    async (nodeId: string, officer: MedicalOfficerContext): Promise<AcknowledgeResult> => {
      try {
        const alert = storeRef.current.getAlert(nodeId);
        if (!alert) {
          throw new Error(`Alert not found for node ${nodeId}`);
        }

        // Create state machine and transition
        const sm = new StateMachine(alert, officer);
        const updatedAlert = sm.transition('ACKNOWLEDGE', {
          officerId: officer.officerId,
          triggeredBy: 'OFFICER',
        });

        // Update store
        storeRef.current.addAlert(nodeId, updatedAlert);
        setAlerts((prev) => {
          const idx = prev.findIndex((a) => a.nodeId === nodeId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedAlert;
            return next;
          }
          return [...prev, updatedAlert];
        });

        // Call existing acknowledge API
        await acknowledgeRiskAlert(nodeId, officer.officerId);

        // Get AI recommendations
        const availableInterventions: InterventionType[] = [
          'Thermal Respite',
          'Counseling Session',
          'Rest Rotation',
          'Medical Check',
          'Workload Redistribution',
          'Hypoxia Acclimatization',
          'Peer Support',
        ];

        const aiRecommendations = await rakshakAI.recommendInterventions(
          updatedAlert,
          availableInterventions
        );

        // Generate clinical summary
        let clinicalSummary;
        try {
          clinicalSummary = await rakshakAI.generateClinicalSummary(updatedAlert);
        } catch (e) {
          console.error('Clinical summary generation failed:', e);
        }

        return {
          success: true,
          alert: updatedAlert,
          interventionId: updatedAlert.currentIntervention?.id || '',
          aiRecommendations,
          clinicalSummary,
          errors: [],
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          alert: storeRef.current.getAlert(nodeId) || createInitialAlertState(nodeId, '', {
            nodeId,
            postId: '',
            timestamp: new Date().toISOString(),
            heartRate: 0,
            hrv: 0,
            spo2: 0,
            sleepHours: 0,
            sleepQuality: 0,
            stressIndex: 0,
            recoveryScore: 0,
            consecutiveShifts: 0,
            altitudeExposure: false,
            hypoxiaLevel: 0,
          }),
          interventionId: '',
          aiRecommendations: [],
          errors: [errorMessage],
        };
      }
    },
    [acknowledgeRiskAlert]
  );

  const resolveIntervention = useCallback(
    async (
      nodeId: string,
      interventionId: string,
      officer: MedicalOfficerContext,
      notes?: string
    ): Promise<ResolveResult> => {
      try {
        const alert = storeRef.current.getAlert(nodeId);
        if (!alert) {
          throw new Error(`Alert not found for node ${nodeId}`);
        }

        // Create state machine and transition
        const sm = new StateMachine(alert, officer);
        const updatedAlert = sm.transition('RESOLVE', {
          officerId: officer.officerId,
          interventionId,
          notes,
          triggeredBy: 'OFFICER',
        });

        // Update store
        storeRef.current.addAlert(nodeId, updatedAlert);
        setAlerts((prev) => {
          const idx = prev.findIndex((a) => a.nodeId === nodeId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedAlert;
            return next;
          }
          return [...prev, updatedAlert];
        });

        return {
          success: true,
          alert: updatedAlert,
          interventionEffectiveness: 85, // Mock effectiveness
          weeklyResolvedCount: 1,
          errors: [],
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          alert: storeRef.current.getAlert(nodeId) || createInitialAlertState(nodeId, '', {
            nodeId,
            postId: '',
            timestamp: new Date().toISOString(),
            heartRate: 0,
            hrv: 0,
            spo2: 0,
            sleepHours: 0,
            sleepQuality: 0,
            stressIndex: 0,
            recoveryScore: 0,
            consecutiveShifts: 0,
            altitudeExposure: false,
            hypoxiaLevel: 0,
          }),
          weeklyResolvedCount: 0,
          errors: [errorMessage],
        };
      }
    },
    []
  );

  const getAIRecommendations = useCallback(
    async (nodeId: string, availableInterventions: InterventionType[]) => {
      const alert = storeRef.current.getAlert(nodeId);
      if (!alert) return [];
      return rakshakAI.recommendInterventions(alert, availableInterventions);
    },
    []
  );

  const getClinicalSummary = useCallback(async (nodeId: string) => {
    const alert = storeRef.current.getAlert(nodeId);
    if (!alert) return null;
    return rakshakAI.generateClinicalSummary(alert);
  }, []);

  const getAlert = useCallback((nodeId: string) => {
    return storeRef.current.getAlert(nodeId);
  }, []);

  const refreshAlerts = useCallback(() => {
    setAlerts(storeRef.current.getAllAlerts());
  }, []);

  return {
    alerts,
    criticalCount,
    pendingCount,
    resolvedCount,
    activeInterventionCount,
    loading: realtimeLoading,
    error: realtimeError || error,
    syncTelemetry,
    acknowledgeAlert,
    resolveIntervention,
    getAIRecommendations,
    getClinicalSummary,
    getAlert,
    refreshAlerts,
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getAuthLevel(role: string): 'T1_SECTOR' | 'T2_BATTALION' | 'T3_PLATOON' | 'T4_PERSONNEL' {
  switch (role) {
    case 'senior_command':
      return 'T1_SECTOR';
    case 'commander':
    case 'welfare_officer':
      return 'T2_BATTALION';
    case 'subordinate_officer':
      return 'T3_PLATOON';
    default:
      return 'T4_PERSONNEL';
  }
}
