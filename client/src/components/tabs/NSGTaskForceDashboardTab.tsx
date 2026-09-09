/**
 * वीरWell (Rakshak AI) — NSG Task Force Command Dashboard
 * 
 * C4ISR Split-View Tactical Deployment Center
 * - Left: ORBAT Sidebar with squad list and micro-sparklines
 * - Right: Main action area with threat map, alerts, and squad details
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, AlertTriangle, Zap, Clock, MapPin,
  Target, Radio, Crosshair, Siren, TrendingUp,
  Activity, UserCheck, CheckCircle,
} from 'lucide-react';
import { BrandedLoader } from '../common/BrandedLoader';
import { OrbatSidebar } from '../tactical/OrbatSidebar';
import { ThreatMapModule } from '../tactical/ThreatMapModule';
import { SquadDetailsGrid } from '../tactical/SquadDetailsGrid';
import { DeploymentOrderModal } from '../tactical/DeploymentOrderModal';
import { SquadStateMachine, createSquadState, createDeploymentOrder } from '../../lib/tactical/nsgStateMachine';
import type { SquadState, DeploymentOrder } from '../../lib/tactical/nsgStateMachine';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_SQUADS: SquadState[] = [
  createSquadState({
    squadId: 's1',
    codename: 'Squad Alpha',
    deploymentType: 'CT',
    location: 'Delhi NCR',
    personnelCount: 24,
    opsTempo: 87,
    readinessScore: 91,
    fatigueFlags: 2,
    lastRotation: '3d ago',
    status: 'DEPLOYED',
    operators: [
      {
        operatorId: 'op-a1',
        callsign: 'Alpha-1',
        tacticalReadiness: 92,
        medicalReadiness: 95,
        psychologicalReadiness: 88,
        fatigueLevel: 25,
        lastRestHours: 8,
        certifications: ['CT Specialist', 'Close Quarters Combat'],
        alerts: [],
      },
      {
        operatorId: 'op-a2',
        callsign: 'Alpha-2',
        tacticalReadiness: 88,
        medicalReadiness: 90,
        psychologicalReadiness: 85,
        fatigueLevel: 30,
        lastRestHours: 7,
        certifications: ['CT Specialist', 'Breaching'],
        alerts: [],
      },
    ],
    logistics: {
      ammunitionLevel: 'FULL',
      transportStatus: 'READY',
      equipment: [
        { id: 'eq-a1', name: 'AK-203 Rifle', category: 'weapon', status: 'OPERATIONAL', quantity: 24, lastInspection: '2024-01-15' },
        { id: 'eq-a2', name: 'NIJ Level IV Armor', category: 'protection', status: 'OPERATIONAL', quantity: 24, lastInspection: '2024-01-15' },
        { id: 'eq-a3', name: 'Tactical Radio Set', category: 'communication', status: 'OPERATIONAL', quantity: 12, lastInspection: '2024-01-15' },
      ],
      supplyLevel: 92,
    },
    telemetry: {
      avgSpO2: 97,
      avgHeartRate: 72,
      avgHRV: 52,
      sleepDebtHours: 0.5,
      stressIndex: 52,
      heatStressLevel: 15,
    },
  }),
  createSquadState({
    squadId: 's2',
    codename: 'Squad Bravo',
    deploymentType: 'VIP',
    location: 'Mumbai',
    personnelCount: 18,
    opsTempo: 72,
    readinessScore: 88,
    fatigueFlags: 1,
    lastRotation: '5d ago',
    status: 'STANDBY',
    operators: [
      {
        operatorId: 'op-b1',
        callsign: 'Bravo-1',
        tacticalReadiness: 90,
        medicalReadiness: 92,
        psychologicalReadiness: 90,
        fatigueLevel: 20,
        lastRestHours: 9,
        certifications: ['VIP Protection', 'Defensive Driving'],
        alerts: [],
      },
    ],
    logistics: {
      ammunitionLevel: 'ADEQUATE',
      transportStatus: 'READY',
      equipment: [
        { id: 'eq-b1', name: 'Glock 17', category: 'weapon', status: 'OPERATIONAL', quantity: 18, lastInspection: '2024-01-15' },
        { id: 'eq-b2', name: 'Armored SUV', category: 'protection', status: 'OPERATIONAL', quantity: 4, lastInspection: '2024-01-15' },
      ],
      supplyLevel: 85,
    },
    telemetry: {
      avgSpO2: 98,
      avgHeartRate: 68,
      avgHRV: 55,
      sleepDebtHours: 0,
      stressIndex: 48,
      heatStressLevel: 10,
    },
  }),
  createSquadState({
    squadId: 's3',
    codename: 'Squad Charlie',
    deploymentType: 'BOMB_DISPOSAL',
    location: 'Chennai',
    personnelCount: 12,
    opsTempo: 95,
    readinessScore: 79,
    fatigueFlags: 5,
    lastRotation: '2d ago',
    status: 'RECOVERY',
    operators: [
      {
        operatorId: 'op-c1',
        callsign: 'Charlie-1',
        tacticalReadiness: 85,
        medicalReadiness: 55,
        psychologicalReadiness: 70,
        fatigueLevel: 85,
        lastRestHours: 3,
        certifications: ['EOD Specialist', 'Demolitions'],
        alerts: ['SpO2 LOW', 'FATIGUE CRITICAL'],
      },
      {
        operatorId: 'op-c2',
        callsign: 'Charlie-2',
        tacticalReadiness: 80,
        medicalReadiness: 60,
        psychologicalReadiness: 75,
        fatigueLevel: 78,
        lastRestHours: 4,
        certifications: ['EOD Specialist'],
        alerts: ['FATIGUE HIGH'],
      },
    ],
    logistics: {
      ammunitionLevel: 'LOW',
      transportStatus: 'STANDBY',
      equipment: [
        { id: 'eq-c1', name: 'EOD Suit Mk IV', category: 'protection', status: 'OPERATIONAL', quantity: 6, lastInspection: '2024-01-10' },
        { id: 'eq-c2', name: 'Bomb Disposal Robot', category: 'demolition', status: 'DEGRADED', quantity: 1, lastInspection: '2024-01-08', certificationExpiry: '2024-02-01' },
        { id: 'eq-c3', name: 'X-ray Scanner', category: 'surveillance', status: 'OPERATIONAL', quantity: 2, lastInspection: '2024-01-15' },
      ],
      supplyLevel: 45,
    },
    telemetry: {
      avgSpO2: 91,
      avgHeartRate: 105,
      avgHRV: 28,
      sleepDebtHours: 4.5,
      stressIndex: 78,
      heatStressLevel: 35,
    },
  }),
  createSquadState({
    squadId: 's4',
    codename: 'Squad Delta',
    deploymentType: 'HOSTAGE_RESCUE',
    location: 'Kolkata',
    personnelCount: 20,
    opsTempo: 68,
    readinessScore: 82,
    fatigueFlags: 3,
    lastRotation: '1w ago',
    status: 'DEBRIEF',
    operators: [
      {
        operatorId: 'op-d1',
        callsign: 'Delta-1',
        tacticalReadiness: 84,
        medicalReadiness: 88,
        psychologicalReadiness: 82,
        fatigueLevel: 35,
        lastRestHours: 6,
        certifications: ['HRT Specialist', 'Breaching', 'CQB'],
        alerts: [],
      },
    ],
    logistics: {
      ammunitionLevel: 'ADEQUATE',
      transportStatus: 'READY',
      equipment: [
        { id: 'eq-d1', name: 'MP5A3', category: 'weapon', status: 'OPERATIONAL', quantity: 20, lastInspection: '2024-01-15' },
        { id: 'eq-d2', name: 'Ballistic Shield', category: 'protection', status: 'OPERATIONAL', quantity: 8, lastInspection: '2024-01-15' },
      ],
      supplyLevel: 78,
    },
    telemetry: {
      avgSpO2: 96,
      avgHeartRate: 75,
      avgHRV: 48,
      sleepDebtHours: 1.5,
      stressIndex: 63,
      heatStressLevel: 20,
    },
  }),
  createSquadState({
    squadId: 's5',
    codename: 'Squad Echo',
    deploymentType: 'CT',
    location: 'Hyderabad',
    personnelCount: 22,
    opsTempo: 91,
    readinessScore: 85,
    fatigueFlags: 4,
    lastRotation: '4d ago',
    status: 'DEPLOYED',
    operators: [
      {
        operatorId: 'op-e1',
        callsign: 'Echo-1',
        tacticalReadiness: 87,
        medicalReadiness: 85,
        psychologicalReadiness: 80,
        fatigueLevel: 45,
        lastRestHours: 5,
        certifications: ['CT Specialist', 'Sniper'],
        alerts: ['FATIGUE MODERATE'],
      },
    ],
    logistics: {
      ammunitionLevel: 'ADEQUATE',
      transportStatus: 'READY',
      equipment: [
        { id: 'eq-e1', name: 'AK-203 Rifle', category: 'weapon', status: 'OPERATIONAL', quantity: 22, lastInspection: '2024-01-15' },
        { id: 'eq-e2', name: 'Armored Vehicle', category: 'protection', status: 'OPERATIONAL', quantity: 3, lastInspection: '2024-01-15' },
      ],
      supplyLevel: 80,
    },
    telemetry: {
      avgSpO2: 96,
      avgHeartRate: 82,
      avgHRV: 42,
      sleepDebtHours: 2.5,
      stressIndex: 68,
      heatStressLevel: 25,
    },
  }),
];

// ─── Component ───────────────────────────────────────────────────────────────

export const NSGTaskForceDashboardTab: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [squads, setSquads] = useState<SquadState[]>(INITIAL_SQUADS);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [draggedSquad, setDraggedSquad] = useState<SquadState | null>(null);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deploymentTargetZone, setDeploymentTargetZone] = useState<string | null>(null);
  const [transitionLog, setTransitionLog] = useState<Array<{ squad: string; from: string; to: string; action: string; success: boolean }>>([]);

  // Squad state machines
  const stateMachinesRef = React.useRef<Map<string, SquadStateMachine>>(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Initialize state machines
  useEffect(() => {
    const machines = new Map<string, SquadStateMachine>();
    squads.forEach((squad) => {
      machines.set(squad.squadId, new SquadStateMachine(squad));
    });
    stateMachinesRef.current = machines;
  }, [squads]);

  const selectedSquad = squads.find((s) => s.squadId === selectedSquadId) || null;

  // Compute stats
  const totalPersonnel = squads.reduce((sum, s) => sum + s.personnelCount, 0);
  const deployed = squads.filter((s) => s.status === 'DEPLOYED').length;
  const avgReadiness = Math.round(squads.reduce((sum, s) => sum + s.readinessScore, 0) / squads.length);
  const avgOpsTempo = Math.round(squads.reduce((sum, s) => sum + s.opsTempo, 0) / squads.length);
  const recoverySquads = squads.filter((s) => s.status === 'RECOVERY').length;

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const handleSquadDragStart = useCallback((squad: SquadState) => {
    setDraggedSquad(squad);
  }, []);

  const handleSquadDragEnd = useCallback(() => {
    setDraggedSquad(null);
    setDeploymentTargetZone(null);
  }, []);

  const handleDeployToZone = useCallback((squadId: string, zoneId: string) => {
    const squad = squads.find((s) => s.squadId === squadId);
    if (!squad) return;

    const machine = stateMachinesRef.current.get(squadId);
    if (!machine) return;

    try {
      const currentState = machine.getCurrentState();

      // Determine objective type from zone
      const zone = [
        { id: 'zone-1', objectiveType: 'CT_OPERATION' as const, threatLevel: 'HIGH' as const },
        { id: 'zone-2', objectiveType: 'VIP_PROTECTION' as const, threatLevel: 'CRITICAL' as const },
        { id: 'zone-3', objectiveType: 'HOSTAGE_RESCUE' as const, threatLevel: 'MEDIUM' as const },
        { id: 'zone-4', objectiveType: 'CT_OPERATION' as const, threatLevel: 'HIGH' as const },
      ].find((z) => z.id === zoneId);

      if (!zone) return;

      // Check if recovery squad needs override
      const needsOverride = currentState.status === 'RECOVERY';

      // Open deployment modal
      setDeploymentTargetZone(zoneId);
      setShowDeploymentModal(true);
    } catch (err) {
      console.error('Deployment transition error:', err);
    }
  }, [squads]);

  const handleConfirmDeployment = useCallback((order: DeploymentOrder) => {
    const machine = stateMachinesRef.current.get(order.assignedSquadId);
    if (!machine) return;

    try {
      const currentState = machine.getCurrentState();

      // Transition to DEPLOYED
      const newState = machine.transition({
        action: 'AUTHORIZE_DEPLOYMENT',
        orderDetails: {
          targetLocation: order.targetLocation,
          objectiveType: order.objectiveType,
          threatLevel: order.threatLevel,
          equipmentVerified: order.equipmentVerified,
          medicalCleared: order.medicalCleared,
          forceOverride: order.forceOverride,
        },
        forceOverride: order.forceOverride,
        commanderId: order.commanderId,
        commanderAuthToken: order.commanderAuthToken,
      });

      // Update squad in state
      setSquads((prev) =>
        prev.map((s) => (s.squadId === order.assignedSquadId ? newState : s))
      );

      // Log transition
      setTransitionLog((prev) => [
        ...prev,
        {
          squad: newState.codename,
          from: currentState.status,
          to: newState.status,
          action: 'AUTHORIZE_DEPLOYMENT',
          success: true,
        },
      ]);

      setShowDeploymentModal(false);
      setDeploymentTargetZone(null);
    } catch (err) {
      console.error('Deployment authorization failed:', err);
    }
  }, []);

  const handleSelectSquad = useCallback((squadId: string) => {
    setSelectedSquadId(squadId);
  }, []);

  if (loading) {
    return <BrandedLoader label="Loading NSG Task Force Command…" />;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* ─── Left: ORBAT Sidebar ─────────────────────────────────────────────── */}
      <div className="w-80 shrink-0">
        <OrbatSidebar
          squads={squads}
          selectedSquadId={selectedSquadId}
          onSelectSquad={handleSelectSquad}
          onDragStart={handleSquadDragStart}
        />
      </div>

      {/* ─── Right: Main Action Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-red-900/80 to-navy-900 border border-red-500/40 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-red-400 uppercase">Active Alerts</span>
              <Siren className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400">
              {squads.reduce((sum, s) => sum + s.fatigueFlags, 0)}
            </div>
            <p className="text-[9px] text-red-300/70 font-mono mt-0.5">
              {recoverySquads} in RECOVERY
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-olive-900 to-navy-900 border border-olive-700/60 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-olive-400 uppercase">Avg Readiness</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{avgReadiness}<span className="text-xs text-olive-500">%</span></div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-olive-900 to-navy-900 border border-olive-700/60 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-olive-400 uppercase">Ops Tempo</span>
              <Radio className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{avgOpsTempo}<span className="text-xs text-olive-500">%</span></div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-olive-900 to-navy-900 border border-olive-700/60 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-olive-400 uppercase">Deployed</span>
              <Zap className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">{deployed}<span className="text-xs text-olive-500">/{squads.length}</span></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Threat Map */}
          <ThreatMapModule
            squads={squads}
            selectedSquadId={selectedSquadId}
            onSquadDragStart={handleSquadDragStart}
            onSquadDragEnd={handleSquadDragEnd}
            onDeployToZone={handleDeployToZone}
            draggedSquad={draggedSquad}
          />

          {/* Squad Details or Alerts */}
          <div className="min-h-0">
            <AnimatePresence mode="wait">
              {selectedSquad ? (
                <SquadDetailsGrid
                  key="details"
                  squad={selectedSquad}
                  onClose={() => setSelectedSquadId(null)}
                  onDeploy={() => setShowDeploymentModal(true)}
                />
              ) : (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-2xl bg-navy-900 border border-olive-700/60 shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-olive-700/60">
                    <h3 className="text-xs font-black text-white tracking-tight uppercase flex items-center gap-2">
                      <Siren className="w-4 h-4 text-rose-400" />
                      NSG Operational Alerts
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {squads.filter((s) => s.fatigueFlags > 0 || s.operators.some((op) => op.alerts.length > 0)).map((squad, idx) => (
                      <motion.div
                        key={squad.squadId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedSquadId(squad.squadId)}
                        className="p-3 rounded-xl bg-olive-950 border border-olive-700/40 cursor-pointer hover:border-olive-600 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{squad.codename}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            squad.status === 'RECOVERY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}>
                            {squad.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {squad.operators.flatMap((op) =>
                            op.alerts.map((alert, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-olive-300">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>{op.callsign}: {alert}</span>
                              </div>
                            ))
                          )}
                          {squad.fatigueFlags > 0 && (
                            <div className="flex items-center gap-2 text-[10px] text-amber-400">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{squad.fatigueFlags} fatigue flags</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {squads.filter((s) => s.fatigueFlags > 0 || s.operators.some((op) => op.alerts.length > 0)).length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs text-olive-400">All systems nominal</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Deployment Order Modal ─────────────────────────────────────────── */}
      <DeploymentOrderModal
        isOpen={showDeploymentModal}
        onClose={() => {
          setShowDeploymentModal(false);
          setDeploymentTargetZone(null);
        }}
        onConfirm={handleConfirmDeployment}
        squad={selectedSquad}
        commanderId={user?.id || 'unknown'}
        commanderAuthToken="tok_nsg_cmd_001"
      />
    </div>
  );
};
