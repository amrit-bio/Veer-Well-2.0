import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkloadRecord } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Kanban,
  Table as TableIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const WorkloadTab: React.FC = () => {
  const { role, isAnonymized } = useAuth();
  const [workloadList, setWorkloadList] = useState<WorkloadRecord[]>([]);
  const [summary, setSummary] = useState<{
    totalTasks: number;
    completedTasks: number;
    overtimeCount: number;
    avgUtilization: number;
  }>({ totalTasks: 0, completedTasks: 0, overtimeCount: 0, avgUtilization: 0 });
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  useEffect(() => {
    loadWorkload();
  }, []);

  const loadWorkload = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkload();
      setWorkloadList(res.workload);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load workload:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = workloadList.filter((w) => {
    const q = search.toLowerCase();
    const matchQ =
      w.anonymizedId.toLowerCase().includes(q) ||
      (w.employeeName && w.employeeName.toLowerCase().includes(q)) ||
      w.roleTitle.toLowerCase().includes(q);
    const matchDept = deptFilter === 'all' || w.department === deptFilter;
    return matchQ && matchDept;
  });

  const kanbanColumns: WorkloadRecord['sprintStatus'][] = [
    'To Do',
    'In Progress',
    'Review',
    'Blocked',
  ];

  // 30-Day Workload Intensity Heatmap Data
  const monthlyHeatmap = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Simulated intensity peaks around mid-month sprints
    const intensity = Math.min(
      100,
      Math.max(25, Math.round(50 + Math.sin(day * 0.45) * 35 + (day % 7 === 0 ? -25 : 10)))
    );
    return { day, intensity };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Operational Bandwidth & Fatigue Mitigator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Workforce Workload & Capacity Distribution
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track duty hours, sprint commitments, capacity saturation, and automated overtime fatigue flags.
          </p>
        </div>

        {/* View Switcher Toggle: Kanban vs Table */}
        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban'
                ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Detail Table</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Avg Utilization Rate
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {summary.avgUtilization}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            Optimal Target: 75-85%
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Overtime Alert Nodes
          </span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            {summary.overtimeCount} Personnel
          </div>
          <span className="text-[10px] text-rose-400 font-mono mt-1 block">
            Logged &gt;45 hrs/week
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Operational Tasks
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {summary.totalTasks} Tasks
          </div>
          <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
            Across 4 Operational Units
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Task Completion Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {Math.round((summary.completedTasks / (summary.totalTasks || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            {summary.completedTasks} Completed
          </span>
        </div>
      </div>

      {/* 30-Day Workload Intensity Heatmap Strip */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              30-Day Monthly Operational Intensity Heatmap
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span>Low (Light)</span>
            <div className="flex gap-1">
              <span className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-800" />
              <span className="w-3 h-3 rounded bg-emerald-600/60 border border-emerald-500" />
              <span className="w-3 h-3 rounded bg-amber-500/80 border border-amber-400" />
              <span className="w-3 h-3 rounded bg-rose-500 border border-rose-400" />
            </div>
            <span>High Crunch (Dark)</span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 my-2">
          {monthlyHeatmap.map((item) => {
            const bg =
              item.intensity > 80
                ? 'bg-rose-500 text-white'
                : item.intensity > 60
                ? 'bg-amber-500/80 text-navy-950 font-bold'
                : item.intensity > 40
                ? 'bg-emerald-600/60 text-slate-200'
                : 'bg-emerald-950/40 text-slate-400';

            return (
              <div
                key={item.day}
                title={`Day ${item.day}: ${item.intensity}% Workload Intensity`}
                className={`h-11 rounded-lg p-1 text-center flex flex-col justify-between transition-all hover:scale-110 cursor-pointer ${bg}`}
              >
                <span className="text-[9px] font-mono">{item.day}</span>
                <span className="text-[8px] font-mono font-bold">{item.intensity}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personnel..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

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
        </div>

        <span className="text-xs font-mono text-slate-400">
          {filtered.length} Personnel Monitored
        </span>
      </div>

      {/* View Mode: 1. Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((colStatus) => {
            const colItems = filtered.filter((w) => w.sprintStatus === colStatus);
            return (
              <div
                key={colStatus}
                className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col min-h-[420px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        colStatus === 'To Do'
                          ? 'bg-slate-400'
                          : colStatus === 'In Progress'
                          ? 'bg-cyan-400'
                          : colStatus === 'Review'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    {colStatus}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      className="glass-card p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 text-xs font-bold">
                          {isAnonymized && role !== 'employee'
                            ? item.anonymizedId
                            : item.employeeName || item.anonymizedId}
                        </span>
                        {item.overtimeFlag && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-2.5 h-2.5" /> Overtime
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-medium">
                        {item.roleTitle}
                      </div>

                      {/* Progress & Utilization Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>
                            {item.weeklyHoursLogged}h logged / {item.capacityHours}h
                          </span>
                          <span
                            className={
                              item.utilizationRate > 100
                                ? 'text-rose-400 font-bold'
                                : 'text-emerald-400'
                            }
                          >
                            {item.utilizationRate}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.utilizationRate > 100
                                ? 'bg-rose-500'
                                : item.utilizationRate > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>Tasks: {item.completedTasks}/{item.assignedTasks}</span>
                        <span className="font-mono text-slate-500">{item.department}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: 2. Table */
        <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Employee ID</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Role Designation</th>
                <th className="pb-3">Tasks (Done/Total)</th>
                <th className="pb-3">Weekly Hours Logged</th>
                <th className="pb-3">Capacity Utilization</th>
                <th className="pb-3">Fatigue Flag</th>
                <th className="pb-3">Sprint State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {isAnonymized && role !== 'employee'
                      ? w.anonymizedId
                      : w.employeeName || w.anonymizedId}
                  </td>
                  <td className="py-3 text-slate-200">{w.department}</td>
                  <td className="py-3 text-slate-400">{w.roleTitle}</td>
                  <td className="py-3 font-mono text-slate-300">
                    {w.completedTasks} / {w.assignedTasks}
                  </td>
                  <td className="py-3 font-mono font-bold text-white">
                    {w.weeklyHoursLogged} hrs
                  </td>
                  <td className="py-3 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        w.utilizationRate > 100
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {w.utilizationRate}%
                    </span>
                  </td>
                  <td className="py-3">
                    {w.overtimeFlag ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Overtime Alert
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-slate-300">{w.sprintStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
