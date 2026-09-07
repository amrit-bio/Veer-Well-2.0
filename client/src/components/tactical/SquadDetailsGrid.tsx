/**
 * वीरWell (Rakshak AI) — Squad Details Grid
 * 
 * Granular squad drill-down showing exact logistical states:
 * - Ammunition levels
 * - Transport status
 * - Individual Operator Readiness thresholds (Tactical, Medical, Psychological)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, UserCheck, Package, Truck, Heart, Brain,
  Activity, AlertTriangle, CheckCircle, Clock, Zap,
  Crosshair, Shield, Target, Radio,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SquadState, OperatorReadiness, SquadEquipment } from '../../lib/tactical/nsgStateMachine';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SquadDetailsGridProps {
  squad: SquadState;
  onClose: () => void;
  onDeploy: () => void;
}

// ─── MIL-STD-2525 Symbology ──────────────────────────────────────────────────

const DEPLOYMENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  CT: { icon: <Crosshair className="w-4 h-4" />, color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' },
  VIP: { icon: <Shield className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' },
  BOMB_DISPOSAL: { icon: <Zap className="w-4 h-4" />, color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' },
  HOSTAGE_RESCUE: { icon: <Target className="w-4 h-4" />, color: 'text-violet-400 bg-violet-500/20 border-violet-500/40' },
  RECON: { icon: <Radio className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  STANDBY: { color: 'text-blue-400 bg-blue-500/20 border-blue-500/40', label: 'STANDBY' },
  DEPLOYED: { color: 'text-rose-400 bg-rose-500/20 border-rose-500/40', label: 'DEPLOYED' },
  RECOVERY: { color: 'text-amber-400 bg-amber-500/20 border-amber-500/40', label: 'RECOVERY' },
  DEBRIEF: { color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40', label: 'DEBRIEF' },
  MAINTENANCE: { color: 'text-slate-400 bg-slate-500/20 border-slate-500/40', label: 'MAINTENANCE' },
};

const AMMO_CONFIG: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: 'text-rose-400', label: 'CRITICAL' },
  LOW: { color: 'text-amber-400', label: 'LOW' },
  ADEQUATE: { color: 'text-emerald-400', label: 'ADEQUATE' },
  FULL: { color: 'text-blue-400', label: 'FULL' },
};

const TRANSPORT_CONFIG: Record<string, { color: string; label: string }> = {
  READY: { color: 'text-emerald-400', label: 'READY' },
  STANDBY: { color: 'text-amber-400', label: 'STANDBY' },
  MAINTENANCE: { color: 'text-slate-400', label: 'MAINTENANCE' },
  UNAVAILABLE: { color: 'text-rose-400', label: 'UNAVAILABLE' },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

const OperatorReadinessBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-olive-400 font-mono flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className={`text-xs font-mono font-bold ${
          value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-amber-400' : 'text-rose-400'
        }`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-olive-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${getColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const EquipmentRow: React.FC<{ equipment: SquadEquipment }> = ({ equipment }) => {
  const statusColors: Record<string, string> = {
    OPERATIONAL: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
    DEGRADED: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    NON_OPERATIONAL: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
    PENDING_CERT: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-olive-950 border border-olive-700/40">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-olive-800">
          {equipment.category === 'weapon' && <Package className="w-3.5 h-3.5 text-olive-400" />}
          {equipment.category === 'protection' && <Shield className="w-3.5 h-3.5 text-olive-400" />}
          {equipment.category === 'communication' && <Radio className="w-3.5 h-3.5 text-olive-400" />}
          {equipment.category === 'medical' && <Activity className="w-3.5 h-3.5 text-olive-400" />}
          {equipment.category === 'demolition' && <Zap className="w-3.5 h-3.5 text-olive-400" />}
          {equipment.category === 'surveillance' && <Crosshair className="w-3.5 h-3.5 text-olive-400" />}
        </div>
        <div>
          <p className="text-xs font-bold text-white">{equipment.name}</p>
          <p className="text-[10px] text-olive-500 font-mono capitalize">
            {equipment.category.replace('_', ' ')} • Qty: {equipment.quantity}
          </p>
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${statusColors[equipment.status]}`}>
        {equipment.status.replace('_', ' ')}
      </span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const SquadDetailsGrid: React.FC<SquadDetailsGridProps> = ({ squad, onClose, onDeploy }) => {
  const [activeTab, setActiveTab] = useState<'operators' | 'logistics' | 'telemetry'>('operators');

  const typeConfig = DEPLOYMENT_TYPE_CONFIG[squad.deploymentType] || DEPLOYMENT_TYPE_CONFIG.CT;
  const statusConfig = STATUS_CONFIG[squad.status] || STATUS_CONFIG.STANDBY;

  // Mock telemetry trend data
  const telemetryTrend = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i * 2}h`,
    spO2: 95 + Math.random() * 4,
    heartRate: 70 + Math.random() * 20,
    hrv: 45 + Math.random() * 15,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col rounded-2xl bg-navy-900 border border-olive-700/60 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-olive-700/60 bg-navy-900/95">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${typeConfig.color}`}>
            {typeConfig.icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">{squad.codename}</h3>
            <p className="text-[10px] text-olive-400 font-mono">
              {squad.deploymentType.replace('_', ' ')} • {squad.location} • {squad.personnelCount} Personnel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDeploy}
            disabled={squad.status === 'DEPLOYED'}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all ${
              squad.status === 'DEPLOYED'
                ? 'bg-olive-800 text-olive-500 border-olive-700 cursor-not-allowed'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {squad.status === 'DEPLOYED' ? 'DEPLOYED' : 'ISSUE IDO'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-olive-800 transition-colors"
          >
            <X className="w-4 h-4 text-olive-400" />
          </button>
        </div>
      </div>

      {/* Status & Readiness Bar */}
      <div className="grid grid-cols-4 gap-3 p-4 border-b border-olive-700/40">
        <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
          <p className="text-[10px] text-olive-500 font-mono mb-1">STATUS</p>
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
          <p className="text-[10px] text-olive-500 font-mono mb-1">READINESS</p>
          <p className={`text-sm font-black font-mono ${
            squad.readinessScore >= 80 ? 'text-emerald-400' :
            squad.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {squad.readinessScore}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
          <p className="text-[10px] text-olive-500 font-mono mb-1">OPS TEMPO</p>
          <p className={`text-sm font-black font-mono ${
            squad.opsTempo > 90 ? 'text-rose-400' : squad.opsTempo > 75 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {squad.opsTempo}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
          <p className="text-[10px] text-olive-500 font-mono mb-1">FATIGUE FLAGS</p>
          <p className={`text-sm font-black font-mono flex items-center gap-1 ${
            squad.fatigueFlags > 3 ? 'text-rose-400' : squad.fatigueFlags > 1 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {squad.fatigueFlags > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
            {squad.fatigueFlags}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-olive-700/40">
        {[
          { id: 'operators', label: 'OPERATORS', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'logistics', label: 'LOGISTICS', icon: <Truck className="w-3.5 h-3.5" /> },
          { id: 'telemetry', label: 'TELEMETRY', icon: <Activity className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono font-bold transition-all ${
              activeTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                : 'text-olive-500 hover:text-olive-300 border-b-2 border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'operators' && (
          <div className="space-y-3">
            {squad.operators.map((operator, idx) => (
              <motion.div
                key={operator.operatorId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-olive-950 border border-olive-700/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-olive-800">
                      <UserCheck className="w-3.5 h-3.5 text-olive-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{operator.callsign}</p>
                      <p className="text-[10px] text-olive-500 font-mono">{operator.operatorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {operator.alerts.map((alert, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        {alert}
                      </span>
                    ))}
                    {operator.alerts.length === 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        CLEAR
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <OperatorReadinessBar
                    label="Tactical"
                    value={operator.tacticalReadiness}
                    icon={<Crosshair className="w-3 h-3" />}
                  />
                  <OperatorReadinessBar
                    label="Medical"
                    value={operator.medicalReadiness}
                    icon={<Heart className="w-3 h-3" />}
                  />
                  <OperatorReadinessBar
                    label="Psychological"
                    value={operator.psychologicalReadiness}
                    icon={<Brain className="w-3 h-3" />}
                  />
                </div>

                <div className="mt-2 flex items-center gap-4 text-[10px] text-olive-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Fatigue: {operator.fatigueLevel}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Rest: {operator.lastRestHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {operator.certifications.length} certs
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-4">
            {/* Ammunition & Transport */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-olive-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Ammunition
                  </span>
                  <span className={`text-xs font-mono font-bold ${AMMO_CONFIG[squad.logistics.ammunitionLevel].color}`}>
                    {AMMO_CONFIG[squad.logistics.ammunitionLevel].label}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-olive-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      squad.logistics.ammunitionLevel === 'FULL' ? 'bg-blue-500 w-full' :
                      squad.logistics.ammunitionLevel === 'ADEQUATE' ? 'bg-emerald-500 w-3/4' :
                      squad.logistics.ammunitionLevel === 'LOW' ? 'bg-amber-500 w-1/2' : 'bg-rose-500 w-1/4'
                    }`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-olive-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Transport
                  </span>
                  <span className={`text-xs font-mono font-bold ${TRANSPORT_CONFIG[squad.logistics.transportStatus].color}`}>
                    {TRANSPORT_CONFIG[squad.logistics.transportStatus].label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-olive-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        squad.logistics.transportStatus === 'READY' ? 'bg-emerald-500 w-full' :
                        squad.logistics.transportStatus === 'STANDBY' ? 'bg-amber-500 w-3/4' :
                        squad.logistics.transportStatus === 'MAINTENANCE' ? 'bg-blue-500 w-1/2' : 'bg-rose-500 w-1/4'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Supply Level */}
            <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-olive-400">Supply Level</span>
                <span className="text-xs font-mono font-bold text-white">{squad.logistics.supplyLevel}%</span>
              </div>
              <div className="h-2 rounded-full bg-olive-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-emerald-500"
                  style={{ width: `${squad.logistics.supplyLevel}%` }}
                />
              </div>
              {squad.logistics.resupplyEta && (
                <p className="text-[10px] text-olive-500 font-mono mt-1">
                  Resupply ETA: {squad.logistics.resupplyEta}
                </p>
              )}
            </div>

            {/* Equipment List */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-olive-400 uppercase tracking-wider">Equipment Manifest</h4>
              {squad.logistics.equipment.map((eq) => (
                <EquipmentRow key={eq.id} equipment={eq} />
              ))}
              {squad.logistics.equipment.length === 0 && (
                <p className="text-xs text-olive-500 text-center py-4">No equipment records</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
                <p className="text-[10px] text-olive-500 font-mono mb-1">Avg SpO2</p>
                <p className={`text-lg font-black font-mono ${
                  squad.telemetry.avgSpO2 >= 95 ? 'text-emerald-400' :
                  squad.telemetry.avgSpO2 >= 90 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {squad.telemetry.avgSpO2}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
                <p className="text-[10px] text-olive-500 font-mono mb-1">Avg Heart Rate</p>
                <p className={`text-lg font-black font-mono ${
                  squad.telemetry.avgHeartRate <= 80 ? 'text-emerald-400' :
                  squad.telemetry.avgHeartRate <= 100 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {squad.telemetry.avgHeartRate} <span className="text-xs text-olive-500">BPM</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
                <p className="text-[10px] text-olive-500 font-mono mb-1">Avg HRV</p>
                <p className={`text-lg font-black font-mono ${
                  squad.telemetry.avgHRV >= 50 ? 'text-emerald-400' :
                  squad.telemetry.avgHRV >= 35 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {squad.telemetry.avgHRV} <span className="text-xs text-olive-500">ms</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-700/40">
                <p className="text-[10px] text-olive-500 font-mono mb-1">Sleep Debt</p>
                <p className={`text-lg font-black font-mono ${
                  squad.telemetry.sleepDebtHours <= 1 ? 'text-emerald-400' :
                  squad.telemetry.sleepDebtHours <= 3 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {squad.telemetry.sleepDebtHours}h
                </p>
              </div>
            </div>

            {/* Live Telemetry Chart */}
            <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40">
              <h4 className="text-xs font-mono text-olive-400 uppercase tracking-wider mb-3">
                Live Physiological Trend (12h)
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={telemetryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f3d29" opacity={0.3} />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={[80, 120]} />
                  <Tooltip
                    contentStyle={{
                      background: '#0c140b',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line type="monotone" dataKey="spO2" stroke="#10b981" strokeWidth={1.5} dot={false} name="SpO2 %" />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={1.5} dot={false} name="HR BPM" />
                  <Line type="monotone" dataKey="hrv" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="HRV ms" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
