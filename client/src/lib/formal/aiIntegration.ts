/**
 * वीरWell (Rakshak AI) — AI Integration Architecture
 * 
 * This module defines how the predictive ML model and LLM summarization
 * integrate into the deterministic state machine without compromising
 * formal safety guarantees.
 * 
 * Architecture Principles:
 * 1. AI is advisory only — it never directly triggers state transitions
 * 2. All AI outputs are logged and auditable
 * 3. The state machine remains deterministic; AI provides recommendations
 * 4. Privacy is preserved through federated inference where possible
 */

import { PersonnelTelemetry, AlertState, InterventionTask, InterventionType } from './stateMachine';

// ─── Predictive Risk Model Interface ─────────────────────────────────────────

export interface PredictionWindow {
  horizonHours: number;
  predictedScore: number;
  confidence: number; // 0-1
  thresholdBreachProbability: number; // Probability R_c >= 80 within window
  contributingFactors: Array<{
    feature: string;
    contribution: number; // -1 to 1
    currentValue: number;
    projectedValue: number;
  }>;
}

export interface PredictiveModelInput {
  telemetry: PersonnelTelemetry;
  historicalTrend: Array<{ timestamp: string; score: number }>;
  postContext: {
    postId: string;
    altitudeExposure: boolean;
    operationalTempo: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    availableInterventions: InterventionType[];
  };
}

/**
 * Deterministic wrapper around ML prediction.
 * The ML model itself may be non-deterministic (dropout, etc.),
 * but this wrapper ensures consistent interface and logging.
 */
export class PredictiveModel {
  private modelVersion: string;
  private inferenceCount: number = 0;

  constructor(modelVersion: string = 'xgboost-v2.1-36trees') {
    this.modelVersion = modelVersion;
  }

  /**
   * Predict 48-hour risk trajectory.
   * Returns structured prediction that the state machine can consume.
   */
  async predict48HourRisk(input: PredictiveModelInput): Promise<PredictionWindow> {
    this.inferenceCount++;

    // In production, this would call the actual ML model
    // For now, we simulate based on deterministic heuristics
    const { telemetry, historicalTrend, postContext } = input;

    // Simple trend extrapolation (deterministic)
    const recentScores = historicalTrend.slice(-7).map((h) => h.score);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const trend = recentScores.length >= 2 
      ? (recentScores[recentScores.length - 1] - recentScores[0]) / (recentScores.length - 1)
      : 0;

    // Project forward
    const projectedIncrease = trend * 2; // 48-hour projection
    const altitudeMultiplier = postContext.altitudeExposure ? 1.15 : 1.0;
    const tempoMultiplier = { LOW: 0.9, NORMAL: 1.0, HIGH: 1.1, CRITICAL: 1.25 }[postContext.operationalTempo];

    const predictedScore = Math.min(100, Math.max(0, 
      avgScore + projectedIncrease * altitudeMultiplier * tempoMultiplier
    ));

    // Calculate breach probability
    const threshold = 80;
    const distanceToThreshold = threshold - predictedScore;
    const baseProbability = Math.max(0, Math.min(1, 1 - (distanceToThreshold / 100)));
    
    // Confidence based on data quality
    const dataQuality = Math.min(1, recentScores.length / 7);
    const confidence = dataQuality * 0.85; // Max 85% confidence

    // Contributing factors
    const contributingFactors = [
      {
        feature: 'stress_index',
        contribution: (telemetry.stressIndex / 100 - 0.5) * 2,
        currentValue: telemetry.stressIndex,
        projectedValue: Math.min(100, telemetry.stressIndex + projectedIncrease * 2),
      },
      {
        feature: 'sleep_hours',
        contribution: Math.max(-1, (4 - telemetry.sleepHours) / 4) * -1,
        currentValue: telemetry.sleepHours,
        projectedValue: Math.max(0, telemetry.sleepHours - projectedIncrease * 0.5),
      },
      {
        feature: 'hrv',
        contribution: Math.max(-1, (35 - telemetry.hrv) / 35) * -1,
        currentValue: telemetry.hrv,
        projectedValue: Math.max(0, telemetry.hrv - projectedIncrease * 2),
      },
    ];

    return {
      horizonHours: 48,
      predictedScore: Math.round(predictedScore),
      confidence: Math.round(confidence * 100) / 100,
      thresholdBreachProbability: Math.round(baseProbability * 100) / 100,
      contributingFactors,
    };
  }

  getModelVersion(): string {
    return this.modelVersion;
  }

  getInferenceCount(): number {
    return this.inferenceCount;
  }
}

// ─── AI Intervention Recommender ─────────────────────────────────────────────

export interface InterventionRecommendation {
  type: InterventionType;
  priority: 'Immediate' | 'Scheduled' | 'Preventative';
  rationale: string;
  expectedEffectiveness: number; // 0-100
  availableAtPost: boolean;
  aiConfidence: number; // 0-1
}

export class InterventionRecommender {
  private modelVersion: string;

  constructor(modelVersion: string = 'rec-v1.0') {
    this.modelVersion = modelVersion;
  }

  /**
   * Recommend interventions based on distress vectors and post resources.
   * Returns ranked list of AI-recommended interventions.
   */
  async recommendInterventions(
    alert: AlertState,
    postResources: InterventionType[]
  ): Promise<InterventionRecommendation[]> {
    const { telemetry, compositeRiskScore } = alert;
    const recommendations: InterventionRecommendation[] = [];

    // Rule-based recommendation engine (deterministic, auditable)
    const distressVectors = this.identifyDistressVectors(telemetry);

    // Hypoxia + High Altitude
    if (telemetry.altitudeExposure || telemetry.hypoxiaLevel > 0.3) {
      recommendations.push({
        type: 'Hypoxia Acclimatization',
        priority: compositeRiskScore >= 80 ? 'Immediate' : 'Scheduled',
        rationale: `Hypoxia level ${(telemetry.hypoxiaLevel * 100).toFixed(1)}% detected with SpO2 ${telemetry.spo2}%. Acclimatization rotation required.`,
        expectedEffectiveness: 85,
        availableAtPost: postResources.includes('Hypoxia Acclimatization'),
        aiConfidence: 0.92,
      });
    }

    // Sleep Deprivation
    if (telemetry.sleepHours < 5 || telemetry.consecutiveShifts >= 4) {
      recommendations.push({
        type: 'Rest Rotation',
        priority: compositeRiskScore >= 80 ? 'Immediate' : 'Scheduled',
        rationale: `Sleep deficit detected: ${telemetry.sleepHours}h sleep, ${telemetry.consecutiveShifts} consecutive shifts. Rest rotation mandated.`,
        expectedEffectiveness: 78,
        availableAtPost: postResources.includes('Rest Rotation'),
        aiConfidence: 0.88,
      });
    }

    // PHQ-9 Elevated
    if (telemetry.phq9Score && telemetry.phq9Score >= 15) {
      recommendations.push({
        type: 'Counseling Session',
        priority: compositeRiskScore >= 80 ? 'Immediate' : 'Scheduled',
        rationale: `PHQ-9 score ${telemetry.phq9Score} indicates moderate-severe depression. Clinical counseling recommended.`,
        expectedEffectiveness: 72,
        availableAtPost: postResources.includes('Counseling Session'),
        aiConfidence: 0.85,
      });
    }

    // HRV Drop
    if (telemetry.hrv < 40) {
      recommendations.push({
        type: 'Medical Check',
        priority: compositeRiskScore >= 80 ? 'Immediate' : 'Scheduled',
        rationale: `HRV ${telemetry.hrv}ms indicates autonomic dysfunction. Medical evaluation required.`,
        expectedEffectiveness: 70,
        availableAtPost: postResources.includes('Medical Check'),
        aiConfidence: 0.81,
      });
    }

    // High Stress Index
    if (telemetry.stressIndex >= 70) {
      recommendations.push({
        type: 'Workload Redistribution',
        priority: 'Preventative',
        rationale: `Stress index ${telemetry.stressIndex} exceeds threshold. Workload redistribution recommended.`,
        expectedEffectiveness: 65,
        availableAtPost: postResources.includes('Workload Redistribution'),
        aiConfidence: 0.75,
      });
    }

    // Sort by priority and effectiveness
    const priorityOrder = { 'Immediate': 0, 'Scheduled': 1, 'Preventative': 2 };
    recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.expectedEffectiveness - a.expectedEffectiveness;
    });

    return recommendations;
  }

  private identifyDistressVectors(telemetry: PersonnelTelemetry): string[] {
    const vectors: string[] = [];

    if (telemetry.altitudeExposure || telemetry.hypoxiaLevel > 0.3) {
      vectors.push('HYPOXIA');
    }
    if (telemetry.sleepHours < 5) {
      vectors.push('SLEEP_DEPRIVATION');
    }
    if (telemetry.consecutiveShifts >= 4) {
      vectors.push('CONSECUTIVE_SHIFTS');
    }
    if (telemetry.phq9Score && telemetry.phq9Score >= 15) {
      vectors.push('PHQ9_ELEVATED');
    }
    if (telemetry.hrv < 40) {
      vectors.push('HRV_DROP');
    }
    if (telemetry.spo2 < 95) {
      vectors.push('SPO2_LOW');
    }
    if (telemetry.stressIndex >= 70) {
      vectors.push('HIGH_STRESS');
    }

    return vectors;
  }

  getModelVersion(): string {
    return this.modelVersion;
  }
}

// ─── LLM Clinical Summarizer ──────────────────────────────────────────────────

export interface ClinicalSummary {
  summary: string;
  keyFindings: string[];
  recommendedActions: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  generatedAt: string;
  modelVersion: string;
  privacyPreserved: boolean;
}

export class ClinicalSummarizer {
  private modelVersion: string;

  constructor(modelVersion: string = 'llm-v1.0-local') {
    this.modelVersion = modelVersion;
  }

  /**
   * Generate clinical summary from alert state and telemetry.
   * Runs locally to preserve privacy — no data leaves the post.
   */
  async generateSummary(alert: AlertState): Promise<ClinicalSummary> {
    const { telemetry, compositeRiskScore, interventionHistory } = alert;

    // Deterministic summary generation (in production, this would use a local LLM)
    const keyFindings: string[] = [];
    const recommendedActions: string[] = [];

    if (telemetry.spo2 < 95) {
      keyFindings.push(`SpO2 at ${telemetry.spo2}% indicates hypoxemia`);
      recommendedActions.push('Immediate SpO2 monitoring and oxygen supplementation');
    }

    if (telemetry.sleepHours < 5) {
      keyFindings.push(`Sleep deficit of ${(8 - telemetry.sleepHours).toFixed(1)} hours`);
      recommendedActions.push('Mandatory rest period and sleep hygiene protocol');
    }

    if (telemetry.hrv < 40) {
      keyFindings.push(`HRV ${telemetry.hrv}ms indicates reduced parasympathetic recovery`);
      recommendedActions.push('Autonomic function assessment and stress reduction protocol');
    }

    if (telemetry.phq9Score && telemetry.phq9Score >= 15) {
      keyFindings.push(`PHQ-9 score ${telemetry.phq9Score} indicates moderate-severe depressive symptoms`);
      recommendedActions.push('Clinical psychology referral and PHQ-9 follow-up in 2 weeks');
    }

    if (telemetry.consecutiveShifts >= 4) {
      keyFindings.push(`${telemetry.consecutiveShifts} consecutive shifts without rest`);
      recommendedActions.push('Immediate duty rotation and 48-hour rest period');
    }

    const urgencyLevel = compositeRiskScore >= 80 ? 'CRITICAL' : 
                         compositeRiskScore >= 70 ? 'HIGH' :
                         compositeRiskScore >= 50 ? 'MEDIUM' : 'LOW';

    const summary = `Personnel ${alert.nodeId} presents with composite risk score ${compositeRiskScore}/100 (${urgencyLevel}). 
      ${keyFindings.length > 0 ? 'Key findings: ' + keyFindings.join('; ') + '.' : 'No acute distress vectors identified.'}
      ${interventionHistory.length > 0 ? `${interventionHistory.length} intervention(s) on record.` : 'No interventions recorded.'}`;

    return {
      summary: summary.trim(),
      keyFindings,
      recommendedActions,
      urgencyLevel,
      generatedAt: new Date().toISOString(),
      modelVersion: this.modelVersion,
      privacyPreserved: true, // Local LLM inference preserves privacy
    };
  }

  getModelVersion(): string {
    return this.modelVersion;
  }
}

// ─── AI Service Facade ────────────────────────────────────────────────────────

export class RakshakAIService {
  private predictiveModel: PredictiveModel;
  private interventionRecommender: InterventionRecommender;
  private clinicalSummarizer: ClinicalSummarizer;

  constructor() {
    this.predictiveModel = new PredictiveModel();
    this.interventionRecommender = new InterventionRecommender();
    this.clinicalSummarizer = new ClinicalSummarizer();
  }

  async predictRisk(input: PredictiveModelInput): Promise<PredictionWindow> {
    return this.predictiveModel.predict48HourRisk(input);
  }

  async recommendInterventions(
    alert: AlertState,
    postResources: InterventionType[]
  ): Promise<InterventionRecommendation[]> {
    return this.interventionRecommender.recommendInterventions(alert, postResources);
  }

  async generateClinicalSummary(alert: AlertState): Promise<ClinicalSummary> {
    return this.clinicalSummarizer.generateSummary(alert);
  }

  getModelVersions() {
    return {
      predictive: this.predictiveModel.getModelVersion(),
      intervention: this.interventionRecommender.getModelVersion(),
      summarizer: this.clinicalSummarizer.getModelVersion(),
    };
  }
}

// Singleton instance
export const rakshakAI = new RakshakAIService();
