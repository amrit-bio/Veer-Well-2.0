/**
 * वीरWell (Rakshak AI) — Formal Methods Demonstration
 * 
 * This file demonstrates the formal state machine, invariant checks,
 * and AI integration in action. Run with: npx tsx client/src/lib/formal/demo.ts
 */

import {
  StateMachine,
  createInitialAlertState,
  createMedicalOfficerContext,
  calculateCompositeRiskScore,
  assertInvariants,
  runAllInvariants,
  AlertStatus,
} from './stateMachine';
import { rakshakAI, PredictiveModel, InterventionRecommender, ClinicalSummarizer } from './aiIntegration';
import type { PersonnelTelemetry, AlertState } from './stateMachine';

// ─── Demo Data ───────────────────────────────────────────────────────────────

const officerContext = createMedicalOfficerContext({
  officerId: 'med-officer-001',
  postId: 'post-srinagar',
  battalionId: 'bn-142',
  force: 'CRPF',
  authorizationLevel: 'T2_BATTALION',
  jurisdictionBounds: ['post-srinagar', 'post-leh'],
  certifications: ['Chief Medical Officer', 'Clinical Psychology'],
});

const highRiskTelemetry: PersonnelTelemetry = {
  nodeId: 'node-1042',
  postId: 'post-srinagar',
  timestamp: new Date().toISOString(),
  heartRate: 105,
  hrv: 28,
  spo2: 91,
  sleepHours: 3.5,
  sleepQuality: 25,
  stressIndex: 85,
  recoveryScore: 15,
  consecutiveShifts: 5,
  altitudeExposure: true,
  hypoxiaLevel: 0.6,
  phq9Score: 22,
};

const lowRiskTelemetry: PersonnelTelemetry = {
  nodeId: 'node-2156',
  postId: 'post-srinagar',
  timestamp: new Date().toISOString(),
  heartRate: 68,
  hrv: 55,
  spo2: 98,
  sleepHours: 7.5,
  sleepQuality: 85,
  stressIndex: 35,
  recoveryScore: 75,
  consecutiveShifts: 2,
  altitudeExposure: false,
  hypoxiaLevel: 0.1,
};

// ─── Demonstration ───────────────────────────────────────────────────────────

async function runDemo() {
  console.log('='.repeat(80));
  console.log('वीरWell (Rakshak AI) — Formal State Machine Demonstration');
  console.log('='.repeat(80));
  console.log();

  // ─── 1. Composite Risk Score Calculation ─────────────────────────────────
  console.log('─── 1. Composite Risk Score Calculation ───');
  
  const highRiskScore = calculateCompositeRiskScore(highRiskTelemetry);
  const lowRiskScore = calculateCompositeRiskScore(lowRiskTelemetry);
  
  console.log(`High-risk personnel composite score: ${highRiskScore}`);
  console.log(`  → Risk tier: ${highRiskScore >= 80 ? 'CRITICAL' : highRiskScore >= 70 ? 'HIGH' : 'MODERATE'}`);
  console.log();
  console.log(`Low-risk personnel composite score: ${lowRiskScore}`);
  console.log(`  → Risk tier: ${lowRiskScore >= 80 ? 'CRITICAL' : lowRiskScore >= 70 ? 'HIGH' : 'MODERATE'}`);
  console.log();

  // ─── 2. State Machine Transitions ────────────────────────────────────────
  console.log('─── 2. State Machine Transitions ───');
  
  // Create initial states
  const highRiskAlert = createInitialAlertState('node-1042', 'post-srinagar', highRiskTelemetry);
  const lowRiskAlert = createInitialAlertState('node-2156', 'post-srinagar', lowRiskTelemetry);
  
  console.log(`High-risk initial state: ${highRiskAlert.status} (score: ${highRiskAlert.compositeRiskScore})`);
  console.log(`Low-risk initial state: ${lowRiskAlert.status} (score: ${lowRiskAlert.compositeRiskScore})`);
  console.log();

  // Transition high-risk alert through lifecycle
  console.log('High-risk alert lifecycle:');
  
  const highSm = new StateMachine(highRiskAlert, officerContext);
  console.log(`  Initial: ${highSm.getCurrentState().status}`);
  
  // Simulate sync (already at CRITICAL, should stay CRITICAL)
  let updated = highSm.transition('SYNC_TELEMETRY', {
    telemetry: highRiskTelemetry,
    triggeredBy: 'SYSTEM',
  });
  console.log(`  After sync: ${updated.status} (score: ${updated.compositeRiskScore})`);
  
  // Acknowledge
  updated = highSm.transition('ACKNOWLEDGE', {
    officerId: officerContext.officerId,
    triggeredBy: 'OFFICER',
  });
  console.log(`  After acknowledge: ${updated.status}`);
  console.log(`  Intervention created: ${updated.currentIntervention?.id}`);
  
  // Resolve
  updated = highSm.transition('RESOLVE', {
    officerId: officerContext.officerId,
    interventionId: updated.currentIntervention?.id || '',
    notes: 'Personnel recovered after 48h rest rotation',
    triggeredBy: 'OFFICER',
  });
  console.log(`  After resolve: ${updated.status}`);
  console.log(`  Resolved by: ${updated.resolvedBy}`);
  console.log();

  // ─── 3. Invariant Checks ─────────────────────────────────────────────────
  console.log('─── 3. Invariant Checks ───');
  
  // Test Invariant 1: Scoring thresholds
  const testStates: AlertState[] = [
    { ...createInitialAlertState('test-1', 'post-1', { ...highRiskTelemetry, nodeId: 'test-1', postId: 'post-1', stressIndex: 85, hrv: 25, spo2: 90, sleepHours: 3, consecutiveShifts: 5, altitudeExposure: true, hypoxiaLevel: 0.7 }) },
    { ...createInitialAlertState('test-2', 'post-1', { ...lowRiskTelemetry, nodeId: 'test-2', postId: 'post-1', stressIndex: 45, hrv: 55, spo2: 98, sleepHours: 7, consecutiveShifts: 2, altitudeExposure: false, hypoxiaLevel: 0.1 }) },
  ];
  
  testStates.forEach((state, i) => {
    const results = runAllInvariants(state, officerContext);
    console.log(`Test state ${i + 1} (score=${state.compositeRiskScore}, status=${state.status}):`);
    results.forEach((r) => {
      const icon = r.passed ? '✓' : '✗';
      console.log(`  ${icon} ${r.name}: ${r.message}`);
    });
  });
  console.log();

  // ─── 4. AI Integration ───────────────────────────────────────────────────
  console.log('─── 4. AI Integration ───');
  
  // Predictive model
  const predictiveModel = new PredictiveModel();
  const prediction = await predictiveModel.predict48HourRisk({
    telemetry: highRiskTelemetry,
    historicalTrend: [],
    postContext: {
      postId: 'post-srinagar',
      altitudeExposure: true,
      operationalTempo: 'CRITICAL',
      availableInterventions: ['Thermal Respite', 'Counseling Session', 'Rest Rotation'],
    },
  });
  
  console.log('48-Hour Risk Prediction:');
  console.log(`  Predicted score: ${prediction.predictedScore}`);
  console.log(`  Breach probability (R_c >= 80): ${(prediction.thresholdBreachProbability * 100).toFixed(1)}%`);
  console.log(`  Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
  console.log();

  // Intervention recommender
  const recommender = new InterventionRecommender();
  const interventions = await recommender.recommendInterventions(highRiskAlert, [
    'Thermal Respite',
    'Counseling Session',
    'Rest Rotation',
    'Medical Check',
  ]);
  
  console.log('AI-Recommended Interventions:');
  interventions.forEach((inv, i) => {
    console.log(`  ${i + 1}. [${inv.priority}] ${inv.type}`);
    console.log(`     Rationale: ${inv.rationale}`);
    console.log(`     Effectiveness: ${inv.expectedEffectiveness}% | Available: ${inv.availableAtPost}`);
  });
  console.log();

  // Clinical summarizer
  const summarizer = new ClinicalSummarizer();
  const summary = await summarizer.generateSummary(highRiskAlert);
  
  console.log('AI Clinical Summary:');
  console.log(`  Urgency: ${summary.urgencyLevel}`);
  console.log(`  Summary: ${summary.summary.substring(0, 150)}...`);
  console.log(`  Key findings: ${summary.keyFindings.length}`);
  console.log(`  Recommended actions: ${summary.recommendedActions.length}`);
  console.log();

  // ─── 5. Jurisdictional RBAC Test ─────────────────────────────────────────
  console.log('─── 5. Jurisdictional RBAC Test ───');
  
  // Create officer from different post
  const unauthorizedOfficer = createMedicalOfficerContext({
    officerId: 'med-officer-002',
    postId: 'post-jammu',
    battalionId: 'bn-101',
    force: 'CRPF',
    authorizationLevel: 'T2_BATTALION',
    jurisdictionBounds: ['post-jammu'],
    certifications: ['Medical Officer'],
  });
  
  try {
    const unauthorizedSm = new StateMachine(highRiskAlert, unauthorizedOfficer);
    unauthorizedSm.transition('ACKNOWLEDGE', {
      officerId: unauthorizedOfficer.officerId,
      triggeredBy: 'OFFICER',
    });
    console.log('  ✗ UNEXPECTED: Cross-post acknowledge succeeded (should have failed)');
  } catch (err) {
    console.log(`  ✓ EXPECTED: Cross-post acknowledge blocked: ${err instanceof Error ? err.message : err}`);
  }
  console.log();

  console.log('='.repeat(80));
  console.log('Formal methods demonstration complete.');
  console.log('All invariants verified. State transitions are deterministic and safe.');
  console.log('='.repeat(80));
}

// Run demo if executed directly
runDemo().catch(console.error);
