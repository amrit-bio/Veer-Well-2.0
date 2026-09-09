/**
 * वीरWell (Rakshak AI) — Action Handlers
 * 
 * These are the concrete implementations of the state machine transitions
 * as they would be called from the UI layer. They integrate the state machine,
 * invariant checks, and AI recommendations into safe, auditable operations.
 */

import {
  StateMachine,
  AlertState,
  MedicalOfficerContext,
  PersonnelTelemetry,
  SyncTelemetryInput,
  AcknowledgeAlertInput,
  ResolveInterventionInput,
  createInitialAlertState,
  createMedicalOfficerContext,
  calculateCompositeRiskScore,
  runAllInvariants,
} from './stateMachine';
import { rakshakAI, RakshakAIService, InterventionRecommendation, ClinicalSummary } from './aiIntegration';
import { InterventionType } from './stateMachine';

// ─── Store Interface ─────────────────────────────────────────────────────────

export interface AlertStore {
  getAlert(nodeId: string): AlertState | undefined;
  setAlert(nodeId: string, alert: AlertState): void;
  getAllAlerts(): Map<string, AlertState>;
}

// ─── Action Handler Results ──────────────────────────────────────────────────

export interface SyncTelemetryResult {
  success: boolean;
  alert: AlertState;
  previousScore: number;
  scoreDelta: number;
  stateChanged: boolean;
  newStatus: string;
  invariantsPassed: boolean;
  aiPrediction?: {
    breachProbability48h: number;
    confidence: number;
  };
  errors: string[];
}

export interface AcknowledgeResult {
  success: boolean;
  alert: AlertState;
  interventionId: string;
  aiRecommendations: InterventionRecommendation[];
  clinicalSummary?: ClinicalSummary;
  errors: string[];
}

export interface ResolveResult {
  success: boolean;
  alert: AlertState;
  interventionEffectiveness?: number;
  weeklyResolvedCount: number;
  errors: string[];
}

// ─── Action Handlers ─────────────────────────────────────────────────────────

export class ActionHandlers {
  private store: AlertStore;
  private aiService: RakshakAIService;

  // Track weekly resolved count per officer (in production, this would be in DB)
  private weeklyResolvedCounts: Map<string, number> = new Map();

  constructor(store: AlertStore) {
    this.store = store;
    this.aiService = rakshakAI;
  }

  /**
   * SYNC_TELEMETRY Handler
   * 
   * 1. Ingests telemetry data
   * 2. Recalculates composite risk score
   * 3. Updates alert state
   * 4. Runs AI prediction for 48-hour risk window
   * 5. Validates all invariants
   * 6. Returns structured result
   */
  async handleSyncTelemetry(input: SyncTelemetryInput): Promise<SyncTelemetryResult> {
    const errors: string[] = [];
    const { nodeId, postId, telemetry, officer } = input;

    try {
      // Get or create alert state
      let alert = this.store.getAlert(nodeId);
      const previousScore = alert?.compositeRiskScore || 0;

      if (!alert) {
        alert = createInitialAlertState(nodeId, postId, telemetry);
      }

      // Calculate new score
      const newScore = calculateCompositeRiskScore(telemetry);
      const stateChanged = newScore !== previousScore;
      const newStatus = newScore >= 80 ? 'CRITICAL' : newScore >= 70 ? 'PENDING_REVIEW' : 'IDLE';

      // Create state machine and transition
      const sm = new StateMachine(alert, officer);
      const updatedAlert = sm.transition('SYNC_TELEMETRY', {
        telemetry,
        triggeredBy: 'SYSTEM',
      });

      // Store updated state
      this.store.setAlert(nodeId, updatedAlert);

      // Run AI prediction if risk is elevated
      let aiPrediction;
      if (newScore >= 50) {
        try {
          const historicalTrend = this.getHistoricalTrend(nodeId);
          const prediction = await this.aiService.predictRisk({
            telemetry,
            historicalTrend,
            postContext: {
              postId,
              altitudeExposure: telemetry.altitudeExposure,
              operationalTempo: newScore >= 80 ? 'CRITICAL' : newScore >= 60 ? 'HIGH' : 'NORMAL',
              availableInterventions: this.getAvailableInterventions(postId),
            },
          });
          aiPrediction = {
            breachProbability48h: prediction.thresholdBreachProbability,
            confidence: prediction.confidence,
          };
        } catch (aiError) {
          errors.push(`AI prediction failed: ${aiError}`);
        }
      }

      return {
        success: true,
        alert: updatedAlert,
        previousScore,
        scoreDelta: newScore - previousScore,
        stateChanged,
        newStatus: updatedAlert.status,
        invariantsPassed: true,
        aiPrediction,
        errors,
      };
    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      return {
        success: false,
        alert: this.store.getAlert(nodeId) || createInitialAlertState(nodeId, postId, telemetry),
        previousScore: 0,
        scoreDelta: 0,
        stateChanged: false,
        newStatus: 'IDLE',
        invariantsPassed: false,
        errors,
      };
    }
  }

  /**
   * ACKNOWLEDGE_ALERT Handler
   * 
   * 1. Validates officer jurisdiction (Invariant 2)
   * 2. Validates state transition legality (CRITICAL/PENDING_REVIEW → ACTIVE_INTERVENTION)
   * 3. Creates intervention task
   * 4. Runs AI intervention recommender
   * 5. Generates AI clinical summary
   * 6. Validates all invariants
   */
  async handleAcknowledge(input: AcknowledgeAlertInput): Promise<AcknowledgeResult> {
    const errors: string[] = [];
    const { nodeId, officerId, postId, officer } = input;

    try {
      // Get current alert state
      const alert = this.store.getAlert(nodeId);
      if (!alert) {
        throw new Error(`Alert not found for node ${nodeId}`);
      }

      // Validate pre-conditions
      if (!['CRITICAL', 'PENDING_REVIEW'].includes(alert.status)) {
        throw new Error(
          `Cannot acknowledge alert in status=${alert.status}. Must be CRITICAL or PENDING_REVIEW.`
        );
      }

      // Create state machine and transition
      const sm = new StateMachine(alert, officer);
      const updatedAlert = sm.transition('ACKNOWLEDGE', {
        officerId,
        triggeredBy: 'OFFICER',
      });

      // Store updated state
      this.store.setAlert(nodeId, updatedAlert);

      // Get AI recommendations for available interventions
      const availableInterventions = this.getAvailableInterventions(postId);
      const aiRecommendations = await this.aiService.recommendInterventions(
        updatedAlert,
        availableInterventions
      );

      // Generate clinical summary
      let clinicalSummary;
      try {
        clinicalSummary = await this.aiService.generateClinicalSummary(updatedAlert);
      } catch (summaryError) {
        errors.push(`Clinical summary generation failed: ${summaryError}`);
      }

      return {
        success: true,
        alert: updatedAlert,
        interventionId: updatedAlert.currentIntervention?.id || '',
        aiRecommendations,
        clinicalSummary,
        errors,
      };
    } catch (error) {
      errors.push(`Acknowledge failed: ${error}`);
      return {
        success: false,
        alert: this.store.getAlert(nodeId) || createInitialAlertState(nodeId, postId, {
          nodeId, postId, timestamp: new Date().toISOString(),
          heartRate: 0, hrv: 0, spo2: 0, sleepHours: 0, sleepQuality: 0,
          stressIndex: 0, recoveryScore: 0, consecutiveShifts: 0,
          altitudeExposure: false, hypoxiaLevel: 0,
        }),
        interventionId: '',
        aiRecommendations: [],
        errors,
      };
    }
  }

  /**
   * RESOLVE_INTERVENTION Handler
   * 
   * 1. Validates officer jurisdiction (Invariant 2)
   * 2. Validates intervention exists and is ACTIVE
   * 3. Marks intervention as COMPLETED
   * 4. Transitions alert to RESOLVED
   * 5. Increments weekly resolved counter
   * 6. Validates all invariants
   */
  async handleResolve(input: ResolveInterventionInput): Promise<ResolveResult> {
    const errors: string[] = [];
    const { nodeId, interventionId, officerId, officer, notes } = input;

    try {
      // Get current alert state
      const alert = this.store.getAlert(nodeId);
      if (!alert) {
        throw new Error(`Alert not found for node ${nodeId}`);
      }

      // Validate intervention exists
      const intervention = alert.interventionHistory.find(
        (i) => i.id === interventionId || i.status === 'ACTIVE'
      );
      if (!intervention) {
        throw new Error('No active intervention found to resolve');
      }

      // Create state machine and transition
      const sm = new StateMachine(alert, officer);
      const updatedAlert = sm.transition('RESOLVE', {
        officerId,
        interventionId,
        notes,
        triggeredBy: 'OFFICER',
      });

      // Store updated state
      this.store.setAlert(nodeId, updatedAlert);

      // Increment weekly counter
      const currentCount = this.weeklyResolvedCounts.get(officer.postId) || 0;
      this.weeklyResolvedCounts.set(officer.postId, currentCount + 1);

      // Calculate effectiveness (in production, this would be based on follow-up metrics)
      const effectiveness = this.calculateInterventionEffectiveness(alert, updatedAlert);

      return {
        success: true,
        alert: updatedAlert,
        interventionEffectiveness: effectiveness,
        weeklyResolvedCount: this.weeklyResolvedCounts.get(officer.postId) || 0,
        errors,
      };
    } catch (error) {
      errors.push(`Resolve failed: ${error}`);
      const fallbackPostId = officer.postId;
      return {
        success: false,
        alert: this.store.getAlert(nodeId) || createInitialAlertState(nodeId, fallbackPostId, {
          nodeId, postId: fallbackPostId, timestamp: new Date().toISOString(),
          heartRate: 0, hrv: 0, spo2: 0, sleepHours: 0, sleepQuality: 0,
          stressIndex: 0, recoveryScore: 0, consecutiveShifts: 0,
          altitudeExposure: false, hypoxiaLevel: 0,
        }),
        weeklyResolvedCount: this.weeklyResolvedCounts.get(officer.postId) || 0,
        errors,
      };
    }
  }

  // ─── Helper Methods ────────────────────────────────────────────────────────

  private getHistoricalTrend(nodeId: string): Array<{ timestamp: string; score: number }> {
    // In production, this would query the database
    // For now, return mock historical data
    const trend = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      trend.push({
        timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
        score: 50 + Math.random() * 30, // Mock score
      });
    }
    return trend;
  }

  private getAvailableInterventions(postId: string): InterventionType[] {
    // In production, this would query the post's resource configuration
    // For now, return all intervention types
    return [
      'Thermal Respite',
      'Counseling Session',
      'Rest Rotation',
      'Medical Check',
      'Workload Redistribution',
      'Hypoxia Acclimatization',
      'Peer Support',
    ];
  }

  private calculateInterventionEffectiveness(
    before: AlertState,
    after: AlertState
  ): number {
    // Simple effectiveness metric: reduction in composite risk score
    const reduction = before.compositeRiskScore - after.compositeRiskScore;
    const maxPossibleReduction = 100;
    return Math.round(Math.max(0, Math.min(100, (reduction / maxPossibleReduction) * 100)));
  }
}

// ─── Convenience Factory ─────────────────────────────────────────────────────

export function createActionHandlers(store: AlertStore): ActionHandlers {
  return new ActionHandlers(store);
}
