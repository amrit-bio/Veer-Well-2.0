import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { InterventionAction } from '../../types';
import {
  HeartPulse,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Calendar,
  RotateCcw,
  Check,
  UserCheck,
  Zap,
  Plus,
  X,
  Filter,
} from 'lucide-react';

export const InterventionsTab: React.FC = () => {
  const { user, role } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Pending' | 'Resolved'>('All');
  const [showNewModal, setShowNewModal] = useState(false);

  const [actions, setActions] = useState<InterventionAction[]>([
    {
      id: 'int-1',
      title: 'Mandatory 48-Hour Hypoxia Recovery Rest Rotation',
      targetUnit: 'ITBP Forward Post Leh (High Altitude Sector)',
      targetRole: 'Night Patrol Detachment (6 Personnel)',
      urgency: 'Immediate',
      category: 'Rest Rotation',
      description: 'Continuous nocturnal SpO2 drops below 91% and severe HRV depression over 4 consecutive high-tempo patrols.',
      counselingPrompt: '“Officer, your telemetry shows significant hypoxia fatigue accumulation. We are rotating your unit to base camp for 48h active oxygen recovery and thermal wind-down.”',
      status: 'Active',
      timestamp: '20 mins ago',
    },
    {
      id: 'int-2',
      title: 'Post-Mission Psychological Debriefing & Counseling Session',
      targetUnit: '209 CoBRA Bn (Special Ops Detachment)',
      targetRole: 'Reconnaissance Scouts',
      urgency: 'Scheduled',
      category: 'Counseling Session',
      description: 'Follow-up psychological safety debriefing following 10-day intensive counter-insurgency jungle deployment.',
      counselingPrompt: '“Focus on emotional decompression and peer camaraderie. Review sleep architecture and address acute duty stressors in a safe, non-judgmental environment.”',
      status: 'Pending Commander Approval',
      timestamp: '1 hour ago',
    },
    {
      id: 'int-3',
      title: 'Tactical Shift Workload Redistribution Roster',
      targetUnit: '142 Bn (Srinagar Sector Command)',
      targetRole: 'Urban Sentry Units',
      urgency: 'Preventative',
      category: 'Workload Redistribution',
      description: 'Duty hours exceeded 52h/week threshold. Rebalance rotation with Reserve Bravo detachment to avert burnout creep.',
      counselingPrompt: '“Reassigning 8 sentry rotations to relief personnel. Encourage utilization of 3-day Wellness Recharge leave block.”',
      status: 'Pending Commander Approval',
      timestamp: '3 hours ago',
    },
    {
      id: 'int-4',
      title: 'Unit Morale Recognition & Psychological Recharge Respite',
      targetUnit: '88 Mahila Bn (Rapid Action Detachment)',
      targetRole: 'All Ranks',
      urgency: 'Preventative',
      category: 'Medical Check',
      description: 'Exemplary 96% voluntary resilience participation. Allocate 2-day battalion wellness recharge window.',
      counselingPrompt: '“Commend personnel on high camaraderie and open communication. Provide relaxation and biofeedback sessions.”',
      status: 'Resolved',
      timestamp: 'Yesterday',
    },
  ]);

  const [selectedAction, setSelectedAction] = useState<InterventionAction | null>(actions[0]);

  // New Directive Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUnit, setNewUnit] = useState('142 Bn (Srinagar Sector)');
  const [newRole, setNewRole] = useState('Patrol Detachment');
  const [newUrgency, setNewUrgency] = useState<'Immediate' | 'Scheduled' | 'Preventative'>('Scheduled');
  const [newCategory, setNewCategory] = useState<'Rest Rotation' | 'Counseling Session' | 'Workload Redistribution' | 'Medical Check'>('Rest Rotation');
  const [newDesc, setNewDesc] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  const handleApprove = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Active' as const } : a))
    );
    if (selectedAction?.id === id) {
      setSelectedAction((prev) => (prev ? { ...prev, status: 'Active' as const } : null));
    }
  };

  const handleResolve = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' as const } : a))
    );
    if (selectedAction?.id === id) {
      setSelectedAction((prev) => (prev ? { ...prev, status: 'Resolved' as const } : null));
    }
  };

  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDirective: InterventionAction = {
      id: `int-${Date.now()}`,
      title: newTitle,
      targetUnit: newUnit,
      targetRole: newRole,
      urgency: newUrgency,
      category: newCategory,
      description: newDesc || 'Clinical directive issued by Welfare Officer for workforce fatigue remediation.',
      counselingPrompt: newPrompt || '“Ensure supportive, non-stigmatizing dialogue centered on restorative recovery.”',
      status: role === 'commander' ? 'Active' : 'Pending Commander Approval',
      timestamp: 'Just now',
    };

    setActions((prev) => [newDirective, ...prev]);
    setSelectedAction(newDirective);
    setShowNewModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewPrompt('');
  };

  const filteredActions = actions.filter((a) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return a.status === 'Active';
    if (filterStatus === 'Pending') return a.status === 'Pending Commander Approval';
    if (filterStatus === 'Resolved') return a.status === 'Resolved';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Welfare Officer Clinical Directives
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Automated Intervention & Welfare Recommendations
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            Actionable rest rotations, counseling prompts, and workload rebalancing directives generated by the clinical fatigue engine.
          </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-accent-gold hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Directive</span>
          </button>
        </div>
      </div>

      {/* Grid: Actions List on Left, Detailed Directive Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actions List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-gold" />
              Generated Welfare Directives
            </span>
            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {(['All', 'Active', 'Pending', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    filterStatus === st
                      ? 'bg-accent-gold text-navy-950 font-bold'
                      : 'text-olive-300 hover:text-white bg-olive-900/60'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredActions.map((act) => {
              const isSelected = selectedAction?.id === act.id;
              return (
                <motion.div
                  key={act.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedAction(act)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-olive-900/90 border-accent-gold shadow-lg shadow-amber-500/10'
                      : 'bg-olive-950/60 border-olive-800 hover:border-olive-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        act.urgency === 'Immediate'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : act.urgency === 'Scheduled'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {act.urgency} Urgency
                    </span>
                    <span className="text-[10px] font-mono text-olive-400">{act.timestamp}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug">{act.title}</h3>
                  <div className="text-[11px] text-olive-300 font-mono">{act.targetUnit}</div>

                  <div className="flex items-center justify-between pt-2 border-t border-olive-800 text-[10px]">
                    <span className="text-accent-gold font-semibold">{act.category}</span>
                    <span
                      className={`font-mono font-bold ${
                        act.status === 'Active'
                          ? 'text-emerald-400'
                          : act.status === 'Resolved'
                          ? 'text-slate-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Directive Dossier & Prompts (7 Cols) */}
        {selectedAction ? (
          <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-3xl border border-olive-400/30 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
                  {selectedAction.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    selectedAction.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedAction.status === 'Resolved'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {selectedAction.status}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{selectedAction.title}</h2>
                <div className="text-xs text-olive-300 font-mono mt-1">
                  Target: <strong>{selectedAction.targetUnit}</strong> • {selectedAction.targetRole}
                </div>
              </div>

              {/* Rationale & Diagnostic Description */}
              <div className="p-4 rounded-2xl bg-olive-900/70 border border-olive-700/60 text-xs text-olive-100 leading-relaxed">
                <span className="font-bold text-accent-gold block mb-1">
                  Physiological & Operational Rationale:
                </span>
                {selectedAction.description}
              </div>

              {/* Counseling Prompt for Welfare Officers */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-accent-gold/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-accent-gold font-bold">
                  <MessageSquare className="w-4 h-4" />
                  <span>Recommended Supportive Counseling Script (For Welfare Officer):</span>
                </div>
                <p className="text-olive-100 italic leading-relaxed">
                  {selectedAction.counselingPrompt}
                </p>
              </div>
            </div>

            {/* Action Buttons for Commander / Welfare Officer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-olive-800">
              <span className="text-xs text-olive-300 font-mono">
                Authorized By: <strong>{user.rank} {user.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedAction.status === 'Pending Commander Approval' && (
                  <button
                    onClick={() => handleApprove(selectedAction.id)}
                    className="px-4 py-2 rounded-xl bg-accent-gold hover:bg-yellow-400 text-navy-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Rest Directive</span>
                  </button>
                )}

                {selectedAction.status === 'Active' && (
                  <button
                    onClick={() => handleResolve(selectedAction.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Directive Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 glass-panel p-8 rounded-3xl border border-olive-400/30 flex items-center justify-center text-olive-400 text-xs">
            Select a welfare directive on the left to inspect clinical protocols.
          </div>
        )}
      </div>

      {/* Modal: Create New Directive */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl glass-panel border border-accent-gold/40 p-6 md:p-8 bg-olive-950 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-olive-800 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent-gold" />
                  <h3 className="text-base font-bold text-white">Create New Clinical Welfare Directive</h3>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-lg text-olive-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDirective} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-olive-200 mb-1 font-semibold">Directive Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., 48-Hour Decompression Leave for Bravo Outpost"
                    className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3.5 py-2 text-white placeholder:text-olive-400 focus:outline-none focus:border-accent-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-olive-200 mb-1 font-semibold">Target Unit</label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold"
                    >
                      <option>142 Bn (Srinagar Sector)</option>
                      <option>209 CoBRA (Gaya)</option>
                      <option>88 Mahila Bn (Delhi)</option>
                      <option>ITBP Forward Post Leh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-olive-200 mb-1 font-semibold">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold"
                    >
                      <option>Rest Rotation</option>
                      <option>Counseling Session</option>
                      <option>Workload Redistribution</option>
                      <option>Medical Check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-olive-200 mb-1 font-semibold">Urgency</label>
                    <select
                      value={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.value as any)}
                      className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-gold"
                    >
                      <option>Immediate</option>
                      <option>Scheduled</option>
                      <option>Preventative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-olive-200 mb-1 font-semibold">Target Role</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Night Sentry Detachment"
                      className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-accent-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-olive-200 mb-1 font-semibold">Operational Rationale</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe physiological trigger (e.g. HRV decline, consecutive night shifts)..."
                    className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3.5 py-2 text-white placeholder:text-olive-400 focus:outline-none focus:border-accent-gold"
                  />
                </div>

                <div>
                  <label className="block text-olive-200 mb-1 font-semibold">Counseling Script Prompt</label>
                  <textarea
                    rows={2}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Supportive dialogue guidance for Welfare Officer..."
                    className="w-full bg-olive-900 border border-olive-700 rounded-xl px-3.5 py-2 text-white placeholder:text-olive-400 focus:outline-none focus:border-accent-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-olive-800">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 rounded-xl text-olive-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-accent-gold hover:bg-amber-400 text-navy-950 font-bold shadow-md"
                  >
                    Issue Directive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

