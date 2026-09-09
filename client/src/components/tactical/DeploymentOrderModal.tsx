/**
 * वीरWell (Rakshak AI) — Deployment Order Modal
 * 
 * Pre-deployment checklist modal enforcing military safety protocols.
 * Requires explicit confirmation before authorizing a deployment.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, AlertTriangle, CheckCircle, MapPin, UserCheck,
  Package, Stethoscope, FileCheck, Zap, Lock, Unlock,
  ClipboardList, Radio, Crosshair, Target,
} from 'lucide-react';
import type { SquadState, DeploymentOrder, ThreatLevel, ObjectiveType } from '../../lib/tactical/nsgStateMachine';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DeploymentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: DeploymentOrder) => void;
  squad: SquadState | null;
  commanderId: string;
  commanderAuthToken: string;
}

// ─── MIL-STD-2525 Symbology ──────────────────────────────────────────────────

const MILSYMB_ICONS: Record<string, React.ReactNode> = {
  CT: <Crosshair className="w-5 h-5" />,
  VIP: <Shield className="w-5 h-5" />,
  BOMB_DISPOSAL: <Zap className="w-5 h-5" />,
  HOSTAGE_RESCUE: <Target className="w-5 h-5" />,
  RECON: <Radio className="w-5 h-5" />,
};

const THREAT_COLORS: Record<ThreatLevel, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  CRITICAL: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' },
  EXTREME: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-500/60' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const DeploymentOrderModal: React.FC<DeploymentOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  squad,
  commanderId,
  commanderAuthToken,
}) => {
  const [targetLocation, setTargetLocation] = useState('');
  const [objectiveType, setObjectiveType] = useState<ObjectiveType>('CT_OPERATION');
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('MEDIUM');
  const [equipmentVerified, setEquipmentVerified] = useState(false);
  const [medicalCleared, setMedicalCleared] = useState(false);
  const [forceOverride, setForceOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetLocation('');
      setObjectiveType('CT_OPERATION');
      setThreatLevel('MEDIUM');
      setEquipmentVerified(false);
      setMedicalCleared(false);
      setForceOverride(false);
      setOverrideReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!squad) return null;

  const canSubmit =
    targetLocation.trim().length > 0 &&
    (equipmentVerified || forceOverride) &&
    (medicalCleared || forceOverride);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    const order: DeploymentOrder = {
      id: `DEP-${Date.now()}`,
      targetLocation,
      objectiveType,
      threatLevel,
      assignedSquadId: squad.squadId,
      commanderId,
      commanderAuthToken,
      timestamp: new Date().toISOString(),
      equipmentVerified,
      medicalCleared,
      forceOverride,
      overrideReason: forceOverride ? overrideReason : undefined,
      status: 'AUTHORIZED',
    };

    // Simulate async authorization
    await new Promise((resolve) => setTimeout(resolve, 800));

    onConfirm(order);
    setIsSubmitting(false);
  };

  // ─── Pre-Deployment Checklist Items ───────────────────────────────────────

  const checklistItems = [
    {
      id: 'equipment',
      label: 'Equipment Verification',
      description: squad.deploymentType === 'BOMB_DISPOSAL'
        ? 'Bomb Disposal gear must be OPERATIONAL and certified'
        : 'All tactical gear verified and operational',
      verified: equipmentVerified,
      onToggle: () => setEquipmentVerified(!equipmentVerified),
      required: !forceOverride,
      critical: squad.deploymentType === 'BOMB_DISPOSAL',
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      id: 'medical',
      label: 'Medical Clearance',
      description: 'All operators must have medical clearance for deployment',
      verified: medicalCleared,
      onToggle: () => setMedicalCleared(!medicalCleared),
      required: !forceOverride,
      critical: squad.operators.some((op) => op.medicalReadiness < 60),
      icon: <Stethoscope className="w-4 h-4" />,
    },
    {
      id: 'override',
      label: 'Force Override Protocol',
      description: 'Override safety checks (requires authorization reason)',
      verified: forceOverride,
      onToggle: () => setForceOverride(!forceOverride),
      required: false,
      critical: squad.status === 'RECOVERY',
      icon: <Unlock className="w-4 h-4" />,
    },
  ];

  // ─── Critical Alerts ───────────────────────────────────────────────────────

  const criticalAlerts = [
    ...(squad.telemetry.avgSpO2 < 94 ? [`SpO2 critically low: ${squad.telemetry.avgSpO2}%`] : []),
    ...(squad.telemetry.avgHeartRate > 100 ? [`Elevated heart rate: ${squad.telemetry.avgHeartRate} BPM`] : []),
    ...(squad.logistics.ammunitionLevel === 'CRITICAL' ? ['Ammunition at CRITICAL levels'] : []),
    ...(squad.logistics.transportStatus === 'UNAVAILABLE' ? ['Transport UNAVAILABLE'] : []),
    ...(squad.operators.filter((op) => op.fatigueLevel > 80).length > 0
      ? [`${squad.operators.filter((op) => op.fatigueLevel > 80).length} operators with critical fatigue`]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-navy-900 border border-olive-700/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-olive-700/60 bg-navy-900/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    ISSUE DEPLOYMENT ORDER (IDO)
                  </h2>
                  <p className="text-[10px] text-olive-400 font-mono">
                    {squad.codename} • {squad.deploymentType.replace('_', ' ')} • {squad.location}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-olive-800 transition-colors"
              >
                <X className="w-5 h-5 text-olive-400" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Critical Alerts Banner */}
              {criticalAlerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Critical Pre-Deployment Alerts
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {criticalAlerts.map((alert, i) => (
                      <li key={i} className="text-xs text-rose-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {alert}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-olive-400 uppercase tracking-wider">
                    Target Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-500" />
                    <input
                      type="text"
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      placeholder="Enter target location..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-olive-950 border border-olive-700/60 text-white text-sm font-mono placeholder:text-olive-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-olive-400 uppercase tracking-wider">
                    Objective Type
                  </label>
                  <select
                    value={objectiveType}
                    onChange={(e) => setObjectiveType(e.target.value as ObjectiveType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-olive-950 border border-olive-700/60 text-white text-sm font-mono focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="HOSTAGE_RESCUE">Hostage Rescue</option>
                    <option value="VIP_PROTECTION">VIP Protection</option>
                    <option value="BOMB_DISPOSAL">Bomb Disposal</option>
                    <option value="CT_OPERATION">CT Operation</option>
                    <option value="RECONNAISSANCE">Reconnaissance</option>
                    <option value="VIP_ESCORT">VIP Escort</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-olive-400 uppercase tracking-wider">
                    Threat Level Assessment
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(THREAT_COLORS) as ThreatLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setThreatLevel(level)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-mono font-bold border transition-all ${
                          threatLevel === level
                            ? `${THREAT_COLORS[level].bg} ${THREAT_COLORS[level].text} ${THREAT_COLORS[level].border}`
                            : 'bg-olive-950 text-olive-500 border-olive-700/40 hover:border-olive-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-olive-400 uppercase tracking-wider">
                    Squad Readiness
                  </label>
                  <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-olive-300">Overall Readiness</span>
                      <span className={`text-sm font-black font-mono ${
                        squad.readinessScore >= 80 ? 'text-emerald-400' :
                        squad.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {squad.readinessScore}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-olive-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          squad.readinessScore >= 80 ? 'bg-emerald-500' :
                          squad.readinessScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${squad.readinessScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-Deployment Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-olive-400 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Pre-Deployment Checklist
                </h3>

                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.verified
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : item.required
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-olive-950 border-olive-700/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={item.onToggle}
                          disabled={item.required && !item.verified && forceOverride === false}
                          className={`mt-0.5 p-1.5 rounded-lg border transition-all ${
                            item.verified
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : item.required
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-olive-800 border-olive-700 text-olive-500'
                          }`}
                        >
                          {item.verified ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : item.critical ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-current" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-sm font-bold text-white">{item.label}</span>
                            {item.critical && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                CRITICAL
                              </span>
                            )}
                            {item.required && !item.verified && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-olive-400 mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Force Override Reason */}
              {forceOverride && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Override Authorization Reason
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Enter tactical justification for override..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-rose-500/5 border border-rose-500/30 text-white text-sm font-mono placeholder:text-rose-400/50 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 resize-none"
                  />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-olive-700/40">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-olive-800 border border-olive-700 text-olive-300 text-sm font-mono hover:bg-olive-700 transition-colors"
                >
                  ABORT
                </button>

                <div className="flex items-center gap-3">
                  {!canSubmit && (
                    <span className="text-xs text-amber-400 font-mono">
                      Complete required items to authorize
                    </span>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className={`px-6 py-2.5 rounded-xl font-mono text-sm font-bold transition-all ${
                      canSubmit
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-olive-800 border border-olive-700 text-olive-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                        AUTHORIZING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        AUTHORIZE DEPLOYMENT
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
