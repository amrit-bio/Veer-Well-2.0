/**
 * वीरWell (Rakshak AI) — Threat Map Module
 * 
 * Interactive tactical map module with drag-and-drop deployment zones.
 * Displays active threat areas where squads can be deployed.
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, AlertTriangle, Crosshair, Shield, Zap,
  Target, Radio, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { SquadState, ThreatLevel } from '../../lib/tactical/nsgStateMachine';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ThreatMapModuleProps {
  squads: SquadState[];
  selectedSquadId: string | null;
  onSquadDragStart: (squad: SquadState) => void;
  onSquadDragEnd: () => void;
  onDeployToZone: (squadId: string, zoneId: string) => void;
  draggedSquad: SquadState | null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ThreatZone {
  id: string;
  name: string;
  location: string;
  threatLevel: ThreatLevel;
  coordinates: { x: number; y: number };
  width: number;
  height: number;
  objectiveType: string;
  description: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const THREAT_ZONES: ThreatZone[] = [
  {
    id: 'zone-1',
    name: 'DELHI NCR PERIMETER',
    location: 'Delhi NCR',
    threatLevel: 'HIGH',
    coordinates: { x: 15, y: 20 },
    width: 25,
    height: 20,
    objectiveType: 'CT_OPERATION',
    description: 'Potential VBIED threat. High-density civilian area.',
  },
  {
    id: 'zone-2',
    name: 'MUMBAAI MARINE DRIVE',
    location: 'Mumbai',
    threatLevel: 'CRITICAL',
    coordinates: { x: 10, y: 55 },
    width: 20,
    height: 18,
    objectiveType: 'VIP_PROTECTION',
    description: 'VIP motorcade route. Hostile surveillance confirmed.',
  },
  {
    id: 'zone-3',
    name: 'CHENNAI PORT ACCESS',
    location: 'Chennai',
    threatLevel: 'MEDIUM',
    coordinates: { x: 60, y: 70 },
    width: 22,
    height: 15,
    objectiveType: 'HOSTAGE_RESCUE',
    description: 'Shipping container anomaly. Possible hostage situation.',
  },
  {
    id: 'zone-4',
    name: 'HYDERABAD TECH HUB',
    location: 'Hyderabad',
    threatLevel: 'HIGH',
    coordinates: { x: 45, y: 45 },
    width: 20,
    height: 18,
    objectiveType: 'CT_OPERATION',
    description: 'Cyber-physical attack vector. Infrastructure at risk.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const ThreatMapModule: React.FC<ThreatMapModuleProps> = ({
  squads,
  selectedSquadId,
  onSquadDragStart,
  onSquadDragEnd,
  onDeployToZone,
  draggedSquad,
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'LOW': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', pulse: 'bg-emerald-500' };
      case 'MEDIUM': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', pulse: 'bg-amber-500' };
      case 'HIGH': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', pulse: 'bg-orange-500' };
      case 'CRITICAL': return { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', pulse: 'bg-rose-500' };
      case 'EXTREME': return { bg: 'bg-red-600/10', border: 'border-red-500/50', text: 'text-red-400', pulse: 'bg-red-500' };
    }
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zoneId);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZone(null);
    if (draggedSquad) {
      onDeployToZone(draggedSquad.squadId, zoneId);
      onSquadDragEnd();
    }
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-navy-900 border border-olive-700/60 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-olive-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
              <MapPin className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-tight uppercase">
                Tactical Operations Map
              </h3>
              <p className="text-[10px] text-olive-500 font-mono">
                {THREAT_ZONES.length} Active Zones • Drag squad to deploy
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-olive-800 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-olive-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-olive-400" />
            )}
          </button>
        </div>
      </div>

      {/* Map Area */}
      {isExpanded && (
        <div className="flex-1 relative overflow-hidden">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #4d6942 1px, transparent 1px),
                linear-gradient(to bottom, #4d6942 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Threat Zones */}
          {THREAT_ZONES.map((zone) => {
            const colors = getThreatColor(zone.threatLevel);
            const isHovered = hoveredZone === zone.id;
            const isDragOver = dragOverZone === zone.id;

            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onDragOver={(e) => handleDragOver(e, zone.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, zone.id)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`absolute cursor-pointer transition-all ${
                  isDragOver ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-navy-900' : ''
                }`}
                style={{
                  left: `${zone.coordinates.x}%`,
                  top: `${zone.coordinates.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
              >
                <div className={`h-full w-full rounded-xl border-2 ${colors.bg} ${colors.border} p-3 flex flex-col justify-between transition-all ${
                  isHovered || isDragOver ? 'shadow-lg' : ''
                }`}>
                  {/* Zone Header */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className={`w-3.5 h-3.5 ${colors.text}`} />
                      <span className="text-[10px] font-mono font-bold text-white uppercase">
                        {zone.name}
                      </span>
                    </div>
                    <p className="text-[9px] text-olive-400 font-mono">{zone.location}</p>
                  </div>

                  {/* Zone Details */}
                  <div>
                    <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} border-current mb-1`}>
                      {zone.threatLevel}
                    </span>
                    <p className="text-[9px] text-olive-400 line-clamp-2">{zone.description}</p>
                  </div>

                  {/* Pulse Animation for Critical/High */}
                  {(zone.threatLevel === 'CRITICAL' || zone.threatLevel === 'HIGH') && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-navy-900/90 border border-olive-700/40 backdrop-blur">
            <p className="text-[9px] font-mono text-olive-400 uppercase mb-2">Threat Levels</p>
            <div className="space-y-1">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EXTREME'] as ThreatLevel[]).map((level) => {
                const colors = getThreatColor(level);
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.pulse}`} />
                    <span className="text-[9px] font-mono text-olive-300">{level}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drag Indicator */}
          {draggedSquad && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 backdrop-blur">
              <p className="text-xs font-mono font-bold text-amber-400 text-center">
                Dragging: {draggedSquad.codename}
              </p>
              <p className="text-[10px] font-mono text-amber-300 text-center">
                Drop on threat zone to deploy
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deployed Squads Summary */}
      {isExpanded && (
        <div className="p-4 border-t border-olive-700/40">
          <h4 className="text-[10px] font-mono text-olive-400 uppercase tracking-wider mb-2">
            Deployed Forces
          </h4>
          <div className="flex flex-wrap gap-2">
            {squads
              .filter((s) => s.status === 'DEPLOYED')
              .map((squad) => (
                <div
                  key={squad.squadId}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-rose-400">
                    {squad.codename}
                  </span>
                  <span className="text-[9px] font-mono text-rose-300">
                    {squad.location}
                  </span>
                </div>
              ))}
            {squads.filter((s) => s.status === 'DEPLOYED').length === 0 && (
              <p className="text-[10px] text-olive-500 font-mono">No active deployments</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
