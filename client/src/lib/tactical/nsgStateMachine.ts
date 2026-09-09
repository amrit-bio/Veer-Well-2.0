/**
 * वीरWell (Rakshak AI) — NSG Task Force Tactical State Machine
 * 
 * Formal state machine for squad deployment lifecycle management.
 * Enforces military safety protocols and jurisdictional constraints.
 */

// ─── Primitive Types ─────────────────────────────────────────────────────────

export type SquadStatus = 'STANDBY' | 'DEPLOYED' | 'RECOVERY' | 'DEBRIEF' | 'MAINTENANCE';
export type DeploymentType = 'CT' | 'VIP' | 'BOMB_DISPOSAL' | 'HOSTAGE_RESCUE' | 'RECON';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME';
export type ObjectiveType = 'HOSTAGE_RESCUE' | 'VIP_PROTECTION' | 'BOMB_DISPOSAL' | 'CT_OPERATION' | 'RECONNAISSANCE' | 'VIP_ESCORT';
export type EquipmentStatus = 'OPERATIONAL' | 'DEGRADED' | 'NON_OPERATIONAL' | 'PENDING_CERT';
export type AmmunitionLevel = 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'FULL';
export type TransportStatus = 'READY' | 'STANDBY' | 'MAINTENANCE' | 'UNAVAILABLE';

// ─── Entity Interfaces ───────────────────────────────────────────────────────

export interface SquadEquipment {
  id: string;
  name: string;
  category: 'weapon' | 'protection' | 'communication' | 'medical' | 'demolition' | 'surveillance';
  status: EquipmentStatus;
  quantity: number;
  lastInspection: string;
  certificationExpiry?: string;
}

export interface SquadLogistics {
  ammunitionLevel: AmmunitionLevel;
  transportStatus: TransportStatus;
  equipment: SquadEquipment[];
  supplyLevel: number; // 0-100
  resupplyEta?: string;
}

export interface OperatorReadiness {
  operatorId: string;
  callsign: string;
  tacticalReadiness: number; // 0-100
  medicalReadiness: number; // 0-100
  psychologicalReadiness: number; // 0-100
  fatigueLevel: number; // 0-100
  lastRestHours: number;
  certifications: string[];
  alerts: string[];
}

export interface SquadTelemetry {
  avgSpO2: number;
  avgHeartRate: number;
  avgHRV: number;
  sleepDebtHours: number;
  stressIndex: number;
  heatStressLevel: number;
}

export interface DeploymentOrder {
  id: string;
  targetLocation: string;
  coordinates?: { lat: number; lng: number };
  objectiveType: ObjectiveType;
  threatLevel: ThreatLevel;
  assignedSquadId: string;
  commanderId: string;
  commanderAuthToken: string;
  timestamp: string;
  equipmentVerified: boolean;
  medicalCleared: boolean;
  forceOverride: boolean;
  overrideReason?: string;
  status: 'DRAFT' | 'AUTHORIZED' | 'EXECUTING' | 'COMPLETED' | 'ABORTED';
}

export interface SquadState {
  squadId: string;
  codename: string;
  status: SquadStatus;
  deploymentType: DeploymentType;
  location: string;
  personnelCount: number;
  operators: OperatorReadiness[];
  logistics: SquadLogistics;
  telemetry: SquadTelemetry;
  opsTempo: number; // 0-100
  readinessScore: number; // 0-100
  fatigueFlags: number;
  lastRotation: string;
  currentDeployment?: DeploymentOrder;
  deploymentHistory: DeploymentOrder[];
  metadata: {
    parentForce: string;
    clearanceLevel: string;
    jurisdiction: string[];
    createdAt: string;
    updatedAt: string;
  };
}

// ─── Invariant Checks ───────────────────────────────────────────────────────

export interface InvariantResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

/**
 * Invariant 1: Recovery-to-Deployment Safety
 * A squad in RECOVERY cannot transition to DEPLOYED without forceOverride.
 */
export function checkRecoveryDeploymentInvariant(
  current: SquadState,
  proposed: SquadState
): InvariantResult {
  if (current.status === 'RECOVERY' && proposed.status === 'DEPLOYED') {
    const hasOverride = proposed.currentDeployment?.forceOverride === true;
    if (!hasOverride) {
      return {
        name: 'INV_RECOVERY_DEPLOYMENT',
        passed: false,
        message: `Squad ${current.codename} is in RECOVERY. Cannot deploy without forceOverride.`,
        severity: 'ERROR',
      };
    }
  }
  return {
    name: 'INV_RECOVERY_DEPLOYMENT',
    passed: true,
    message: 'Recovery deployment constraint satisfied',
    severity: 'INFO',
  };
}

/**
 * Invariant 2: Medical Clearance
 * Squad with critical physiological alerts cannot deploy without medical clearance.
 */
export function checkMedicalClearanceInvariant(squad: SquadState): InvariantResult {
  const criticalAlerts = squad.operators.filter(
    (op) => op.medicalReadiness < 50 || op.alerts.some((a) => a.toLowerCase().includes('critical'))
  );

  if (criticalAlerts.length > 0 && squad.status === 'DEPLOYED') {
    const hasMedicalClearance = squad.currentDeployment?.medicalCleared === true;
    if (!hasMedicalClearance) {
      return {
        name: 'INV_MEDICAL_CLEARANCE',
        passed: false,
        message: `${criticalAlerts.length} operators with critical medical alerts lack clearance`,
        severity: 'ERROR',
      };
    }
  }

  return {
    name: 'INV_MEDICAL_CLEARANCE',
    passed: true,
    message: 'Medical clearance constraints satisfied',
    severity: 'INFO',
  };
}

/**
 * Invariant 3: Equipment Verification
 * BOMB_DISPOSAL deployment requires specific equipment verification.
 */
export function checkEquipmentVerificationInvariant(squad: SquadState): InvariantResult {
  if (squad.deploymentType === 'BOMB_DISPOSAL' && squad.status === 'DEPLOYED') {
    const hasRequiredEquipment = squad.logistics.equipment.some(
      (eq) => eq.category === 'demolition' && eq.status === 'OPERATIONAL'
    );
    const isVerified = squad.currentDeployment?.equipmentVerified === true;

    if (!hasRequiredEquipment || !isVerified) {
      return {
        name: 'INV_EQUIPMENT_VERIFICATION',
        passed: false,
        message: 'Bomb Disposal squad requires verified operational demolition equipment',
        severity: 'ERROR',
      };
    }
  }

  return {
    name: 'INV_EQUIPMENT_VERIFICATION',
    passed: true,
    message: 'Equipment verification constraints satisfied',
    severity: 'INFO',
  };
}

/**
 * Invariant 4: Ammunition Minimums
 * Squad cannot deploy with CRITICAL ammunition levels.
 */
export function checkAmmunitionInvariant(squad: SquadState): InvariantResult {
  if (squad.status === 'DEPLOYED' && squad.logistics.ammunitionLevel === 'CRITICAL') {
    return {
      name: 'INV_AMMUNITION',
      passed: false,
      message: `Squad ${squad.codename} has CRITICAL ammunition levels`,
      severity: 'ERROR',
    };
  }
  return {
    name: 'INV_AMMUNITION',
    passed: true,
    message: 'Ammunition constraints satisfied',
    severity: 'INFO',
  };
}

/**
 * Invariant 5: Ops Tempo Limits
 * Squad ops tempo cannot exceed 100%.
 */
export function checkOpsTempoInvariant(squad: SquadState): InvariantResult {
  if (squad.opsTempo > 100) {
    return {
      name: 'INV_OPS_TEMPO',
      passed: false,
      message: `Ops tempo ${squad.opsTempo}% exceeds maximum 100%`,
      severity: 'ERROR',
    };
  }
  return {
    name: 'INV_OPS_TEMPO',
    passed: true,
    message: 'Ops tempo within limits',
    severity: 'INFO',
  };
}

export function runAllSquadInvariants(current: SquadState, proposed: SquadState): InvariantResult[] {
  return [
    checkRecoveryDeploymentInvariant(current, proposed),
    checkMedicalClearanceInvariant(proposed),
    checkEquipmentVerificationInvariant(proposed),
    checkAmmunitionInvariant(proposed),
    checkOpsTempoInvariant(proposed),
  ];
}

export function assertSquadInvariants(current: SquadState, proposed: SquadState): void {
  const results = runAllSquadInvariants(current, proposed);
  const failures = results.filter((r) => !r.passed);

  if (failures.length > 0) {
    const messages = failures.map((f) => `[${f.name}] ${f.message}`).join('\n');
    throw new Error(`SQUAD INVARIANT VIOLATION:\n${messages}`);
  }
}

// ─── State Machine Class ─────────────────────────────────────────────────────

export type TransitionAction = 
  | 'AUTHORIZE_DEPLOYMENT'
  | 'COMPLETE_DEPLOYMENT'
  | 'ABORT_DEPLOYMENT'
  | 'INITIATE_RECOVERY'
  | 'COMPLETE_RECOVERY'
  | 'INITIATE_MAINTENANCE'
  | 'COMPLETE_MAINTENANCE'
  | 'UPDATE_TELEMETRY'
  | 'ACKNOWLEDGE_ALERT';

export interface TransitionInput {
  action: TransitionAction;
  orderDetails?: Partial<DeploymentOrder>;
  operatorUpdates?: Partial<OperatorReadiness>[];
  equipmentUpdates?: Partial<SquadEquipment>[];
  forceOverride?: boolean;
  overrideReason?: string;
  commanderId?: string;
  commanderAuthToken?: string;
}

export class SquadStateMachine {
  private state: SquadState;
  private transitionLog: Array<{
    from: SquadStatus;
    to: SquadStatus;
    action: TransitionAction;
    timestamp: string;
    success: boolean;
    errors: string[];
  }> = [];

  constructor(initialState: SquadState) {
    this.state = initialState;
  }

  getCurrentState(): SquadState {
    return { ...this.state };
  }

  getTransitionLog() {
    return [...this.transitionLog];
  }

  /**
   * Core transition method. All state changes flow through this entry point.
   */
  transition(input: TransitionInput): SquadState {
    const previousStatus = this.state.status;
    const timestamp = new Date().toISOString();
    const errors: string[] = [];

    let newState: SquadState;

    try {
      switch (input.action) {
        case 'AUTHORIZE_DEPLOYMENT':
          newState = this.handleAuthorizeDeployment(input);
          break;
        case 'COMPLETE_DEPLOYMENT':
          newState = this.handleCompleteDeployment(input);
          break;
        case 'ABORT_DEPLOYMENT':
          newState = this.handleAbortDeployment(input);
          break;
        case 'INITIATE_RECOVERY':
          newState = this.handleInitiateRecovery(input);
          break;
        case 'COMPLETE_RECOVERY':
          newState = this.handleCompleteRecovery(input);
          break;
        case 'INITIATE_MAINTENANCE':
          newState = this.handleInitiateMaintenance(input);
          break;
        case 'COMPLETE_MAINTENANCE':
          newState = this.handleCompleteMaintenance(input);
          break;
        case 'UPDATE_TELEMETRY':
          newState = this.handleUpdateTelemetry(input);
          break;
        case 'ACKNOWLEDGE_ALERT':
          newState = this.handleAcknowledgeAlert(input);
          break;
        default:
          throw new Error(`Unknown action: ${input.action}`);
      }

      // Run invariants
      assertSquadInvariants(this.state, newState);

      this.transitionLog.push({
        from: previousStatus,
        to: newState.status,
        action: input.action,
        timestamp,
        success: true,
        errors: [],
      });

      this.state = newState;
      return { ...this.state };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      errors.push(errorMessage);

      this.transitionLog.push({
        from: previousStatus,
        to: this.state.status,
        action: input.action,
        timestamp,
        success: false,
        errors,
      });

      throw err;
    }
  }

  // ─── Transition Handlers ──────────────────────────────────────────────────

  private handleAuthorizeDeployment(input: TransitionInput): SquadState {
    if (!input.orderDetails) {
      throw new Error('Order details required for deployment authorization');
    }

    const order: DeploymentOrder = {
      id: `DEP-${Date.now()}`,
      targetLocation: input.orderDetails.targetLocation || '',
      objectiveType: input.orderDetails.objectiveType || 'CT_OPERATION',
      threatLevel: input.orderDetails.threatLevel || 'MEDIUM',
      assignedSquadId: this.state.squadId,
      commanderId: input.commanderId || 'unknown',
      commanderAuthToken: input.commanderAuthToken || '',
      timestamp: new Date().toISOString(),
      equipmentVerified: input.orderDetails.equipmentVerified || false,
      medicalCleared: input.orderDetails.medicalCleared || false,
      forceOverride: input.forceOverride || false,
      overrideReason: input.overrideReason,
      status: 'AUTHORIZED',
    };

    return {
      ...this.state,
      status: 'DEPLOYED',
      currentDeployment: order,
      deploymentHistory: [...this.state.deploymentHistory, order],
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleCompleteDeployment(_input: TransitionInput): SquadState {
    if (!this.state.currentDeployment) {
      throw new Error('No active deployment to complete');
    }

    const updatedHistory = this.state.deploymentHistory.map((d) =>
      d.id === this.state.currentDeployment!.id ? { ...d, status: 'COMPLETED' as const } : d
    );

    return {
      ...this.state,
      status: 'DEBRIEF',
      currentDeployment: undefined,
      deploymentHistory: updatedHistory,
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleAbortDeployment(_input: TransitionInput): SquadState {
    if (!this.state.currentDeployment) {
      throw new Error('No active deployment to abort');
    }

    const updatedHistory = this.state.deploymentHistory.map((d) =>
      d.id === this.state.currentDeployment!.id ? { ...d, status: 'ABORTED' as const } : d
    );

    return {
      ...this.state,
      status: 'STANDBY',
      currentDeployment: undefined,
      deploymentHistory: updatedHistory,
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleInitiateRecovery(_input: TransitionInput): SquadState {
    return {
      ...this.state,
      status: 'RECOVERY',
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleCompleteRecovery(_input: TransitionInput): SquadState {
    return {
      ...this.state,
      status: 'STANDBY',
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleInitiateMaintenance(_input: TransitionInput): SquadState {
    return {
      ...this.state,
      status: 'MAINTENANCE',
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleCompleteMaintenance(_input: TransitionInput): SquadState {
    return {
      ...this.state,
      status: 'STANDBY',
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  private handleUpdateTelemetry(input: TransitionInput): SquadState {
    const updates: Partial<SquadState> = {
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    if (input.operatorUpdates) {
      updates.operators = this.state.operators.map((op, idx) => ({
        ...op,
        ...(input.operatorUpdates![idx] || {}),
      }));
    }

    if (input.equipmentUpdates) {
      updates.logistics = {
        ...this.state.logistics,
        equipment: this.state.logistics.equipment.map((eq, idx) => ({
          ...eq,
          ...(input.equipmentUpdates![idx] || {}),
        })),
      };
    }

    return { ...this.state, ...updates };
  }

  private handleAcknowledgeAlert(_input: TransitionInput): SquadState {
    return {
      ...this.state,
      metadata: {
        ...this.state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
  }
}

// ─── Factory Functions ──────────────────────────────────────────────────────

export function createSquadState(partial: Partial<SquadState>): SquadState {
  return {
    squadId: partial.squadId || `squad-${Date.now()}`,
    codename: partial.codename || 'Unknown Squad',
    status: partial.status || 'STANDBY',
    deploymentType: partial.deploymentType || 'CT',
    location: partial.location || 'Unknown',
    personnelCount: partial.personnelCount || 0,
    operators: partial.operators || [],
    logistics: partial.logistics || {
      ammunitionLevel: 'ADEQUATE',
      transportStatus: 'READY',
      equipment: [],
      supplyLevel: 75,
    },
    telemetry: partial.telemetry || {
      avgSpO2: 97,
      avgHeartRate: 72,
      avgHRV: 50,
      sleepDebtHours: 0,
      stressIndex: 50,
      heatStressLevel: 0,
    },
    opsTempo: partial.opsTempo || 0,
    readinessScore: partial.readinessScore || 100,
    fatigueFlags: partial.fatigueFlags || 0,
    lastRotation: partial.lastRotation || 'N/A',
    deploymentHistory: partial.deploymentHistory || [],
    metadata: {
      parentForce: partial.metadata?.parentForce || 'NSG',
      clearanceLevel: partial.metadata?.clearanceLevel || 'TOP_SECRET',
      jurisdiction: partial.metadata?.jurisdiction || [],
      createdAt: partial.metadata?.createdAt || new Date().toISOString(),
      updatedAt: partial.metadata?.updatedAt || new Date().toISOString(),
    },
  };
}

export function createDeploymentOrder(partial: Partial<DeploymentOrder>): DeploymentOrder {
  return {
    id: `DEP-${Date.now()}`,
    targetLocation: partial.targetLocation || '',
    objectiveType: partial.objectiveType || 'CT_OPERATION',
    threatLevel: partial.threatLevel || 'MEDIUM',
    assignedSquadId: partial.assignedSquadId || '',
    commanderId: partial.commanderId || 'unknown',
    commanderAuthToken: partial.commanderAuthToken || '',
    timestamp: new Date().toISOString(),
    equipmentVerified: partial.equipmentVerified || false,
    medicalCleared: partial.medicalCleared || false,
    forceOverride: partial.forceOverride || false,
    overrideReason: partial.overrideReason,
    status: partial.status || 'DRAFT',
  };
}
