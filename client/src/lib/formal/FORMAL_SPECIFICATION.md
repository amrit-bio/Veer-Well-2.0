# वीरWell (Rakshak AI) — Formal State Machine Specification

## 1. Formal State Chart (XState Logic)

```javascript
// XState Machine Definition for Personnel Alert Lifecycle
const alertStateMachine = {
  id: 'personnelAlert',
  initial: 'IDLE',
  context: {
    nodeId: '',
    postId: '',
    compositeRiskScore: 0,
    riskTier: 'Low',
    telemetry: null,
    interventionHistory: [],
    currentIntervention: null,
    predictionWindow: 48,
    jurisdictionLocked: true,
    privacyMode: 'ANONYMIZED',
  },
  states: {
    IDLE: {
      on: {
        SYNC_TELELEMETRY: [
          {
            target: 'PENDING_REVIEW',
            cond: (ctx, event) => event.score >= 70 && event.score < 80,
            actions: ['updateScore', 'logTransition'],
          },
          {
            target: 'CRITICAL',
            cond: (ctx, event) => event.score >= 80,
            actions: ['updateScore', 'logTransition', 'triggerCriticalAlert'],
          },
          {
            target: 'IDLE',
            actions: ['updateScore', 'logTransition'],
          },
        ],
      },
    },
    PENDING_REVIEW: {
      on: {
        ACKNOWLEDGE: {
          target: 'ACTIVE_INTERVENTION',
          guard: 'hasJurisdiction',
          actions: ['createIntervention', 'logTransition'],
        },
        SYNC_TELEMETRY: [
          {
            target: 'CRITICAL',
            cond: (ctx, event) => event.score >= 80,
            actions: ['updateScore', 'logTransition', 'escalateToCritical'],
          },
          {
            target: 'IDLE',
            cond: (ctx, event) => event.score < 70,
            actions: ['updateScore', 'logTransition'],
          },
          {
            target: 'PENDING_REVIEW',
            actions: ['updateScore', 'logTransition'],
          },
        ],
      },
    },
    CRITICAL: {
      on: {
        ACKNOWLEDGE: {
          target: 'ACTIVE_INTERVENTION',
          guard: 'hasJurisdiction',
          actions: ['createIntervention', 'logTransition', 'notifyMedicalOfficer'],
        },
        SYNC_TELEMETRY: [
          {
            target: 'IDLE',
            cond: (ctx, event) => event.score < 70,
            actions: ['updateScore', 'logTransition'],
          },
          {
            target: 'PENDING_REVIEW',
            cond: (ctx, event) => event.score >= 70 && event.score < 80,
            actions: ['updateScore', 'logTransition'],
          },
          {
            target: 'CRITICAL',
            actions: ['updateScore', 'logTransition'],
          },
        ],
      },
    },
    ACTIVE_INTERVENTION: {
      on: {
        RESOLVE: {
          target: 'RESOLVED',
          guard: 'hasCompletedIntervention',
          actions: ['completeIntervention', 'logTransition', 'incrementWeeklyCounter'],
        },
        SYNC_TELEMETRY: [
          {
            target: 'CRITICAL',
            cond: (ctx, event) => event.score >= 80,
            actions: ['updateScore', 'logTransition', 'reopenIntervention'],
          },
          {
            target: 'PENDING_REVIEW',
            cond: (ctx, event) => event.score >= 70 && event.score < 80,
            actions: ['updateScore', 'logTransition'],
          },
          {
            target: 'ACTIVE_INTERVENTION',
            actions: ['updateScore', 'logTransition'],
          },
        ],
      },
    },
    RESOLVED: {
      type: 'final',
      on: {
        SYNC_TELEMETRY: [
          {
            target: 'PENDING_REVIEW',
            cond: (ctx, event) => event.score >= 70 && event.score < 80,
            actions: ['reopenAlert', 'logTransition'],
          },
          {
            target: 'CRITICAL',
            cond: (ctx, event) => event.score >= 80,
            actions: ['reopenAlert', 'logTransition', 'triggerCriticalAlert'],
          },
        ],
      },
    },
  },
};
```

---

## 2. TLA+ Formal Specification

```tla
--------------------------- MODULE VeerWellStateMachine ---------------------------

EXTENDS Naturals, Sequences, Sets

CONSTANTS 
  Officers, Posts, Personnel, Interventions, InterventionTypes

VARIABLES 
  alertState,    \* Map from personnel to AlertState
  officerCtx,   \* Map from officer to MedicalOfficerContext
  interventionTasks,  \* Map from interventionId to InterventionTask
  transitionLog \* Sequence of StateTransitionLog

(*
  AlertStatus = {"IDLE", "PENDING_REVIEW", "CRITICAL", "ACTIVE_INTERVENTION", "RESOLVED"}
  InterventionStatus = {"PENDING", "ACTIVE", "COMPLETED", "FAILED"}
  RiskTier = {"Low", "Moderate", "High", "Critical", "Severe"}
*)

TypeInvariant ==
  /\ alertState \in [Personnel -> [
      status \in AlertStatus,
      compositeRiskScore \in 0..100,
      riskTier \in RiskTier,
      telemetry \in Telemetry,
      interventionHistory \in SUBSET(InterventionTasks),
      currentIntervention \in InterventionTasks \cup {None},
      metadata \in [
        jurisdictionLocked \in BOOLEAN,
        privacyMode \in {"ANONYMIZED", "DEANONYMIZED"}
      ]
    ]]
  /\ officerCtx \in [Officers -> [
      postId \in Posts,
      authorizationLevel \in AuthLevel,
      jurisdictionBounds \in SUBSET(Posts),
      deAnonymizationToken \in Token
    ]]

(* Invariant 1: Scoring Thresholds *)
Invariant1ScoringThresholds ==
  \A p \in Personnel:
    LET score == alertState[p].compositeRiskScore
        status == alertState[p].status
    IN
      /\ (score >= 80) => (status = "CRITICAL")
      /\ (70 <= score) /\ (score < 80) => (status = "PENDING_REVIEW")
      /\ (score < 70) => (status = "IDLE")

(* Invariant 2: Monotonic Resolution *)
Invariant2MonotonicResolution ==
  \A p \in Personnel:
    (alertState[p].status = "RESOLVED") =>
      (\E i \in alertState[p].interventionHistory:
        i.status = "COMPLETED"
        /\ \E o \in Officers:
          /\ o \in officerCtx
          /\ i.assignedOfficerId = o
          /\ o.postId = alertState[p].postId
          /\ o.jurisdictionBounds \supseteq {alertState[p].postId}
      )

(* Invariant 3: Privacy Protection *)
Invariant3PrivacyProtection ==
  \A p \in Personnel:
    (alertState[p].metadata.privacyMode = "DEANONYMIZED") =>
      (\E o \in Officers:
        /\ o \in officerCtx
        /\ o.deAnonymizationToken # ""
        /\ o.authorizationLevel \in {"T1_SECTOR", "T2_BATTALION"}
        /\ alertState[p].postId \in o.jurisdictionBounds
      )

(* All invariants must hold at all times *)
SafetyInvariants ==
  /\ TypeInvariant
  /\ Invariant1ScoringThresholds
  /\ Invariant2MonotonicResolution
  /\ Invariant3PrivacyProtection

(* Transition: SyncTelemetry *)
SyncTelemetry(p, telemetry, officer) ==
  LET newScore == CalculateCompositeRiskScore(telemetry)
      newStatus == IF newScore >= 80 THEN "CRITICAL"
                  ELSE IF newScore >= 70 THEN "PENDING_REVIEW"
                  ELSE "IDLE"
      newAlert == [
        status |-> newStatus,
        compositeRiskScore |-> newScore,
        riskTier |-> ScoreToRiskTier(newScore),
        telemetry |-> telemetry,
        interventionHistory |-> {},
        currentIntervention |-> None,
        metadata |-> [
          jurisdictionLocked |-> TRUE,
          privacyMode |-> "ANONYMIZED"
        ]
      ]
  IN
    /\ alertState' = [alertState EXCEPT ![p] = newAlert]
    /\ UNCHANGED <<officerCtx, interventionTasks, transitionLog>>

(* Transition: AcknowledgeAlert *)
AcknowledgeAlert(p, officerId) ==
  LET o == officerCtx[officerId]
      alert == alertState[p]
      newIntervention == [
        id |-> "intv-" \o DateTime(),
        type |-> "Counseling Session",
        status |-> "ACTIVE",
        assignedOfficerId |-> officerId,
        assignedPostId |-> o.postId,
        personnelNodeId |-> p,
        createdAt |-> DateTime(),
        aiRecommended |-> FALSE
      ]
      newAlert == [
        status |-> "ACTIVE_INTERVENTION",
        compositeRiskScore |-> alert.compositeRiskScore,
        riskTier |-> alert.riskTier,
        telemetry |-> alert.telemetry,
        interventionHistory |-> alert.interventionHistory \cup {newIntervention},
        currentIntervention |-> newIntervention,
        metadata |-> alert.metadata
      ]
  IN
    /\ o.postId = alert.postId  \* Jurisdiction check
    /\ p \in DOMAIN alertState
    /\ alertState[p].status \in {"CRITICAL", "PENDING_REVIEW"}
    /\ alertState' = [alertState EXCEPT ![p] = newAlert]
    /\ UNCHANGED <<officerCtx, interventionTasks, transitionLog>>

(* Transition: ResolveIntervention *)
ResolveIntervention(p, interventionId, officerId) ==
  LET o == officerCtx[officerId]
      alert == alertState[p]
      intervention == CHOOSE i \in alert.interventionHistory:
                       i.id = interventionId /\ i.status = "ACTIVE"
      completedIntervention == [
        id |-> intervention.id,
        type |-> intervention.type,
        status |-> "COMPLETED",
        assignedOfficerId |-> intervention.assignedOfficerId,
        assignedPostId |-> intervention.assignedPostId,
        personnelNodeId |-> intervention.personnelNodeId,
        createdAt |-> intervention.createdAt,
        completedAt |-> DateTime(),
        aiRecommended |-> intervention.aiRecommended
      ]
      newHistory == (alert.interventionHistory \ {intervention}) \cup {completedIntervention}
      newAlert == [
        status |-> "RESOLVED",
        compositeRiskScore |-> alert.compositeRiskScore,
        riskTier |-> alert.riskTier,
        telemetry |-> alert.telemetry,
        interventionHistory |-> newHistory,
        currentIntervention |-> None,
        metadata |-> alert.metadata
      ]
  IN
    /\ o.postId = alert.postId  \* Jurisdiction check
    /\ intervention.assignedOfficerId = officerId  \* Assignment check
    /\ p \in DOMAIN alertState
    /\ alertState' = [alertState EXCEPT ![p] = newAlert]
    /\ UNCHANGED <<officerCtx, interventionTasks, transitionLog>>

(* Next-state relation *)
Next ==
  \E p \in Personnel, t \in Telemetry, o \in Officers:
    SyncTelemetry(p, t, o)
  \/ \E p \in Personnel, o \in Officers:
    AcknowledgeAlert(p, o)
  \/ \E p \in Personnel, i \in Interventions, o \in Officers:
    ResolveIntervention(p, i, o)

(* Initial state *)
Init ==
  /\ alertState = [p \in Personnel |-> [
      status |-> "IDLE",
      compositeRiskScore |-> 0,
      riskTier |-> "Low",
      telemetry |-> DefaultTelemetry,
      interventionHistory |-> {},
      currentIntervention |-> None,
      metadata |-> [
        jurisdictionLocked |-> TRUE,
        privacyMode |-> "ANONYMIZED"
      ]
    ]]
  /\ officerCtx = [o \in Officers |-> [
      postId |-> DefaultPost(o),
      authorizationLevel |-> DefaultAuthLevel(o),
      jurisdictionBounds |-> DefaultJurisdiction(o),
      deAnonymizationToken |-> GenerateSecureToken()
    ]]
  /\ interventionTasks = {}
  /\ transitionLog = <<>>

(* Specification *)
Spec == Init /\ [][Next]_<<alertState, officerCtx, interventionTasks, transitionLog>>

(* Safety theorem: All invariants always hold *)
THEOREM Spec => []SafetyInvariants
```

---

## 3. State Transition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERSONNEL ALERT STATE MACHINE                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────┐
                              │   IDLE    │
                              └─────┬─────┘
                                    │
                    SyncTelemetry   │   SyncTelemetry
                    (score < 70)    │   (score >= 70)
                                    ▼
                              ┌───────────┐
                              │ PENDING_  │◄────────────┐
                              │  REVIEW   │             │
                              └─────┬─────┘             │
                                    │                   │
                    ACKNOWLEDGE    │   SyncTelemetry   │   SyncTelemetry
                    (authorized)   │   (score < 70)    │   (score >= 80)
                                    ▼                   │
                              ┌───────────┐            │
                              │  ACTIVE_  │────────────┘
                              │INTERVENTION│
                              └─────┬─────┘
                                    │
                    RESOLVE         │   SyncTelemetry
                    (completed)     │   (score < 70)
                                    ▼
                              ┌───────────┐
                              │  RESOLVED │
                              └───────────┘

TRANSITION GUARDS:
  ACKNOWLEDGE: hasJurisdiction(officer, postId) AND status \in {CRITICAL, PENDING_REVIEW}
  RESOLVE: hasCompletedIntervention AND jurisdictionMatch(officer, postId)

INVARIANT CHECKS (run on every transition):
  [INV1] ScoreThresholds: score >= 80 => CRITICAL, 70 <= score < 80 => PENDING_REVIEW
  [INV2] MonotonicResolution: RESOLVED requires COMPLETED intervention by authorized officer
  [INV3] PrivacyProtection: DEANONYMIZED requires valid token + jurisdiction + auth level
```

---

## 4. Jurisdictional RBAC Matrix

| Action | T1_SECTOR | T2_BATTALION | T3_PLATOON | T4_PERSONNEL |
|--------|-----------|--------------|------------|--------------|
| SYNC_TELEMETRY (own) | ✓ | ✓ | ✓ | ✓ |
| ACKNOWLEDGE (battalion) | ✓ | ✓ (own battalion) | ✗ | ✗ |
| RESOLVE (assigned) | ✓ | ✓ (own post) | ✗ | ✗ |
| DEANONYMIZE | ✓ (with token) | ✓ (with token) | ✗ | ✗ |
| VIEW_AGGREGATE | ✓ | ✓ (own battalion) | ✗ | ✗ |

---

## 5. AI Integration Points (Non-Breaking)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DETERMINISTIC STATE MACHINE                       │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │   SYNC_     │───▶│   SCORE_     │───▶│     TRANSITION_          │   │
│  │  TELEMETRY  │    │  CALCULATOR  │    │     VALIDATOR            │   │
│  └─────────────┘    └──────────────┘    └──────────────────────────┘   │
│         │                   │                       │                   │
│         │                   │                       │                   │
│         ▼                   ▼                       ▼                   │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │   RAW_      │    │   COMPOSITE  │    │     INVARIANT_           │   │
│  │  TELEMETRY  │    │   RISK_SCORE │    │     CHECKER              │   │
│  └─────────────┘    └──────────────┘    └──────────────────────────┘   │
│         │                   │                       │                   │
│         │                   │                       │                   │
│         └───────────────────┼───────────────────────┘                   │
│                             │                                           │
│                             ▼                                           │
│                   ┌───────────────────┐                                 │
│                   │   ADVISORY_AI_   │◄──┐                              │
│                   │   LAYER          │   │                              │
│                   │  (non-blocking)  │   │                              │
│                   └───────────────────┘   │                              │
│                             │              │                              │
│         ┌───────────────────┼──────────────┘                              │
│         │                   │                                              │
│         ▼                   ▼                                              │
│  ┌─────────────┐    ┌──────────────┐                                      │
│  │   48H_      │    │ INTERVENTION │                                      │
│  │ PREDICTION  │    │ RECOMMENDER  │                                      │
│  └─────────────┘    └──────────────┘                                      │
│         │                   │                                              │
│         │                   │                                              │
│         ▼                   ▼                                              │
│  ┌─────────────┐    ┌──────────────┐                                      │
│  │   RISK_     │    │   RANKED_    │                                      │
│  │  PROFILE    │    │ INTERVENTIONS│                                      │
│  └─────────────┘    └──────────────┘                                      │
│                                                                           │
│  Key: AI never directly triggers state transitions.                      │
│       AI only provides advisory recommendations.                          │
│       All state changes require explicit officer action or               │
│       deterministic threshold crossing.                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Privacy Proof Sketch

**Theorem**: Without a valid De-anonymization_Token, the raw Personnel_ID cannot be exposed to the UI layer.

**Proof**:

1. **Token Issuance**: De-anonymization tokens are issued only by the auth system to officers with:
   - `authorizationLevel \in {T1_SECTOR, T2_BATTALION}`
   - `postId \in jurisdictionBounds`
   - Verified medical credentials

2. **Token Storage**: Tokens are stored in `MedicalOfficerContext.deAnonymizationToken`, which is:
   - Never transmitted to the client in raw form
   - Validated server-side before any de-anonymization API call
   - Rotated on a 24-hour cycle

3. **UI Layer Access Control**:
   - The UI layer only receives `anonymizedId` (e.g., `CAPF-NODE-1042`)
   - Raw identity is only exposed via `/api/alerts/{nodeId}/deanonymize` endpoint
   - This endpoint validates:
     ```typescript
     if (!officer.deAnonymizationToken) throw new Error('UNAUTHORIZED');
     if (!officer.jurisdictionBounds.includes(alert.postId)) throw new Error('JURISDICTION');
     ```

4. **Zero-Knowledge Property**: 
   - The mapping from `anonymizedId` to `rawIdentity` is a cryptographic hash
   - Without the token (which is never client-side), the mapping is computationally infeasible to invert
   - Differential privacy noise (k=5) is added to all aggregate queries

5. **Audit Trail**: All de-anonymization events are logged with:
   - Officer ID
   - Timestamp
   - Personnel ID accessed
   - Token used (hashed)

**Conclusion**: The system satisfies the privacy invariant: `¬HasToken(officer) ⇒ CannotExposeRawIdentity(UI)`.

---

## 7. Implementation Checklist

- [x] Formal state machine with 5 states and deterministic transitions
- [x] Invariant 1: Score-to-status mapping enforced in `calculateCompositeRiskScore`
- [x] Invariant 2: Jurisdictional resolution checks in `StateMachine.handleResolve`
- [x] Invariant 3: Privacy mode enforcement in `checkInvariantPrivacyProtection`
- [x] AI integration as advisory-only layer (no direct state mutations)
- [x] Action handlers with explicit error boundaries and invariant validation
- [ ] Integration with existing Supabase real-time streams
- [ ] Unit tests for all state transitions and invariant checks
- [ ] E2E tests for jurisdictional RBAC scenarios
- [ ] Formal verification with TLA+ model checker (TLC)
