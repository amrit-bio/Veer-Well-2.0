/**
 * वीरWell (Rakshak AI) — Formal Methods Module
 * 
 * This module provides the formally verified state machine, invariant checks,
 * AI integration architecture, and action handlers for the clinical dashboard.
 * 
 * Usage:
 *   import { StateMachine, ActionHandlers, createActionHandlers, rakshakAI } from '@/lib/formal';
 */

export { StateMachine } from './stateMachine';
export type {
  AlertStatus,
  InterventionStatus,
  InterventionType,
  RiskTier,
  AuthLevel,
  PersonnelTelemetry,
  MedicalOfficerContext,
  InterventionTask,
  AlertState,
  StateMachineContext,
  StateTransitionLog,
  InvariantCheckResult,
  SyncTelemetryInput,
  AcknowledgeAlertInput,
  ResolveInterventionInput,
} from './stateMachine';
export {
  createMedicalOfficerContext,
  createInitialAlertState,
  calculateCompositeRiskScore,
  scoreToRiskTier,
  scoreToAlertStatus,
  runAllInvariants,
  assertInvariants,
} from './stateMachine';

export { ActionHandlers, createActionHandlers } from './actionHandlers';
export type {
  AlertStore,
  SyncTelemetryResult,
  AcknowledgeResult,
  ResolveResult,
} from './actionHandlers';

export {
  PredictiveModel,
  InterventionRecommender,
  ClinicalSummarizer,
  RakshakAIService,
  rakshakAI,
} from './aiIntegration';
export type {
  PredictionWindow,
  PredictiveModelInput,
  InterventionRecommendation,
  ClinicalSummary,
} from './aiIntegration';
