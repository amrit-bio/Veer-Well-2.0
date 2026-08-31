import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeploymentRecord } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';

export const DeploymentTab: React.FC = () => {
  const { role, isAnonymized } = useAuth();
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadDeployments();
  }, [deptFilter, typeFilter, statusFilter]);

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const res = await api.getDeployments({
        department: deptFilter !== 'all' ? deptFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setDeployments(res.deployments);
    } catch (err) {
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = deployments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.projectName.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.anonymizedId.toLowerCase().includes(q) ||
      d.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Operational Fleet & Mission Deployments
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Field Deployment Logs & Operational Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track tactical on-site rotations, remote command centers, and high-intensity field deployments with continuous stress impact profiling.
          </p>
        </div>

        {/* View Switcher Toggle: Timeline vs Table */}
        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'timeline'
                ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vertical Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Structured Table</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project or location..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Department */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Departments</option>
            <option value="Operations">Operations</option>
            <option value="Healthcare & Field">Healthcare & Field</option>
            <option value="Engineering & IT">Engineering & IT</option>
            <option value="Administration">Administration</option>
          </select>

          {/* Deployment Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Deployment Types</option>
            <option value="High-Intensity Field">High-Intensity Field</option>
            <option value="On-Site Office">On-Site Office</option>
            <option value="Remote Command">Remote Command</option>
            <option value="Hybrid Ops">Hybrid Ops</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filtered.length} Deployment Deployments
        </span>
      </div>

      {/* View Mode: 1. Animated Vertical Timeline */}
      {viewMode === 'timeline' ? (
        <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-slate-800">
          {filtered.map((dep, idx) => (
            <motion.div
              key={dep.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative group"
            >
              {/* Timeline Node Icon */}
              <div className="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 rounded-full bg-navy-950 border-2 border-emerald-400 flex items-center justify-center text-[10px] text-emerald-400 shadow-md shadow-emerald-500/20 group-hover:scale-125 transition-transform">
                {dep.status === 'Active' ? '●' : '✓'}
              </div>

              {/* Deployment Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        dep.deploymentType === 'High-Intensity Field'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : dep.deploymentType === 'Remote Command'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {dep.deploymentType}
                    </span>
                    <h3 className="text-sm font-bold text-white">{dep.projectName}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        dep.stressImpact === 'Elevated'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Stress Impact: {dep.stressImpact}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {dep.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{dep.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono">
                      {dep.startDate} → {dep.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isAnonymized && role !== 'employee'
                        ? `${dep.anonymizedId} (${dep.role})`
                        : `${dep.employeeName || dep.anonymizedId} (${dep.role})`}
                    </span>
                  </div>
                </div>

                {/* Key Milestones */}
                <div className="space-y-1.5 pt-2">
                  {dep.keyMilestones.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* View Mode: 2. Structured Table */
        <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Project / Mission</th>
                <th className="pb-3">Subject ID</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Deployment Type</th>
                <th className="pb-3">Timeline</th>
                <th className="pb-3">Stress Impact</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{d.projectName}</td>
                  <td className="py-3 font-mono text-emerald-400">
                    {isAnonymized && role !== 'employee' ? d.anonymizedId : d.employeeName || d.anonymizedId}
                  </td>
                  <td className="py-3 text-slate-400">{d.department}</td>
                  <td className="py-3 text-slate-300">{d.location}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                      {d.deploymentType}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-400">
                    {d.startDate} → {d.endDate || 'Active'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.stressImpact === 'Elevated'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {d.stressImpact}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
