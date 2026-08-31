import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaveRecord, LeaveBalance } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarHeart,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const LeaveHistoryTab: React.FC = () => {
  const { user, role, isAnonymized } = useAuth();
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);

  // Application Form State
  const [leaveType, setLeaveType] = useState<string>('Wellness Recharge');
  const [startDate, setStartDate] = useState<string>('2026-09-02');
  const [endDate, setEndDate] = useState<string>('2026-09-04');
  const [days, setDays] = useState<number>(3);
  const [reason, setReason] = useState<string>('Preventative physical recovery and mental recharge.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadLeave();
  }, [user]);

  const loadLeave = async () => {
    setLoading(true);
    try {
      const res = await api.getLeave(role === 'employee' ? user?.id : undefined);
      setRecords(res.records);
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to load leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await api.applyLeave({
        employeeId: user.id,
        leaveType,
        startDate,
        endDate,
        days,
        reason,
      });
      setShowApplyModal(false);
      loadLeave();
    } catch (err) {
      console.error('Apply leave error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await api.updateLeaveStatus(id, newStatus);
      loadLeave();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesType = typeFilter === 'all' || r.leaveType === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const chartData = [
    { name: 'Wellness Recharge', Used: balance?.wellnessRecharge.used || 4, Available: (balance?.wellnessRecharge.total || 12) - (balance?.wellnessRecharge.used || 4) },
    { name: 'Sick Leave', Used: balance?.sickLeave.used || 3, Available: (balance?.sickLeave.total || 10) - (balance?.sickLeave.used || 3) },
    { name: 'Casual Leave', Used: balance?.casualLeave.used || 6, Available: (balance?.casualLeave.total || 15) - (balance?.casualLeave.used || 6) },
    { name: 'Earned Leave', Used: balance?.earnedLeave.used || 12, Available: (balance?.earnedLeave.total || 24) - (balance?.earnedLeave.used || 12) },
  ];

  // Simulated August 2026 Calendar Grid Days
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const hasLeave = records.some((r) => {
      const startDay = parseInt(r.startDate.split('-')[2], 10);
      const endDay = parseInt(r.endDate.split('-')[2], 10);
      return dayNum >= startDay && dayNum <= endDay;
    });
    const matchedRecord = records.find((r) => {
      const startDay = parseInt(r.startDate.split('-')[2], 10);
      const endDay = parseInt(r.endDate.split('-')[2], 10);
      return dayNum >= startDay && dayNum <= endDay;
    });
    return { dayNum, hasLeave, matchedRecord };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Rest & Recovery Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Leave History & Wellness Recharge Entitlements
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Proactive wellness leave management designed to mitigate high-tempo operational burnout.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for Wellness Leave</span>
        </button>
      </div>

      {/* Grid: Leave Balances & Entitlement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entitlement Breakdown Cards (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Leave Entitlement Allocation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Annual balance distribution with dedicated Wellness Recharge days.
            </p>
          </div>

          <div className="space-y-3">
            {chartData.map((item) => {
              const total = item.Used + item.Available;
              const pct = Math.round((item.Used / total) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.name}</span>
                    <span className="font-mono text-emerald-400">
                      {item.Used} used / {total} total ({item.Available} left)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Wellness Recharge Policy:</strong> 12 annual paid days reserved strictly for mental restoration, completely separated from medical sick leave.
            </span>
          </div>
        </div>

        {/* Calendar Matrix View (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              August 2026 Leave Calendar Matrix
            </h2>
            <span className="text-xs font-mono text-slate-400">Live Heatmap</span>
          </div>

          {/* 31-Day Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 my-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-[10px] font-mono text-slate-500 uppercase">
                {day}
              </div>
            ))}
            {calendarDays.map((d) => (
              <div
                key={d.dayNum}
                className={`p-2 rounded-xl border text-center transition-all min-h-[46px] flex flex-col justify-between ${
                  d.hasLeave
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold ${
                    d.hasLeave ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {d.dayNum}
                </span>
                {d.hasLeave && (
                  <span className="text-[8px] font-mono text-emerald-400 truncate block">
                    {d.matchedRecord?.leaveType.split(' ')[0]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-slate-400 text-[11px]">Recorded Leave Block</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total 16 Approved Days Logged
            </span>
          </div>
        </div>
      </div>

      {/* Filterable Leave Records Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-bold text-white">Leave Requests & Historic Records</h2>

          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Leave Types</option>
              <option value="Wellness Recharge">Wellness Recharge</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3">Employee ID</th>
                <th className="pb-3">Leave Type</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Days</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Status</th>
                {(role === 'hr_admin' || role === 'team_lead') && (
                  <th className="pb-3 text-right">Approval Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-mono text-emerald-400 font-semibold">
                    {isAnonymized && role !== 'employee' ? r.anonymizedId : r.employeeName || r.anonymizedId}
                  </td>
                  <td className="py-3 font-semibold text-slate-200">{r.leaveType}</td>
                  <td className="py-3 font-mono text-slate-400">
                    {r.startDate} → {r.endDate}
                  </td>
                  <td className="py-3 font-mono font-bold text-white">{r.days} d</td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">{r.reason}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  {(role === 'hr_admin' || role === 'team_lead') && (
                    <td className="py-3 text-right">
                      {r.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(r.id, 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-navy-950 font-semibold text-[10px] transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.id, 'Rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white font-semibold text-[10px] transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">Processed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative"
            >
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                Apply for Rest & Wellness Leave
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Submit an instant leave request to recover from operational duty stress.
              </p>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Wellness Recharge">Wellness Recharge (Mental & Rest)</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Total Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Recovery Reason
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Describe your recharge plan..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-navy-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all mt-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Leave Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
