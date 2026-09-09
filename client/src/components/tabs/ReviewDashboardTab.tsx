/**
 * वीरWell (Rakshak AI) — MHA Review Dashboard
 * 
 * Single admin dashboard to review and approve public signup requests.
 * Only the MHA admin can access this dashboard.
 * 
 * Tabs:
 * 1. Pending Review — awaiting_review queue
 * 2. Approved Personnel — accounts approved and created
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck, UserCheck, UserX, AlertTriangle, CheckCircle,
  Clock, Mail, Shield, RefreshCw, Eye, EyeOff, Lock, Users, ArrowRight,
} from 'lucide-react';
import {
  getReviewQueue,
  approveSignupRequest,
  rejectSignupRequest,
  getApprovedUsers,
} from '../../lib/verification/api';
import type { SignupRequest } from '../../lib/verification/types';
import type { ApprovedUser } from '../../lib/verification/api';

type Tab = 'pending' | 'approved';

export const ReviewDashboardTab: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [queue, setQueue] = useState<SignupRequest[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [queueData, approvedData] = await Promise.all([
        getReviewQueue(),
        getApprovedUsers(),
      ]);
      setQueue(queueData.requests || (queueData as any)?.queue || []);
      setApprovedUsers(approvedData.approved_users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Clear success/error after 5 seconds
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;
    setProcessing(requestId);
    try {
      await approveSignupRequest(requestId, user.id, reviewNotes[requestId]);
      setSuccess('✅ Signup request approved. Supabase Auth account created. User can now login with their email & password.');
      setQueue((prev) => prev.filter((r) => r.id !== requestId));
      // Refresh approved users list
      const approvedData = await getApprovedUsers();
      setApprovedUsers(approvedData.approved_users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user?.id) return;
    if (!reviewNotes[requestId]?.trim()) {
      setError('Review notes are required for rejection');
      return;
    }
    setProcessing(requestId);
    try {
      await rejectSignupRequest(requestId, user.id, reviewNotes[requestId]);
      setSuccess('Signup request rejected');
      setQueue((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'commander': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      case 'welfare_officer': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
      case 'senior_command': return 'text-violet-400 bg-violet-500/20 border-violet-500/40';
      default: return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">MHA Personnel Registry</h2>
              <p className="text-xs text-olive-400 font-mono ml-8">
                Single Admin Dashboard — Review signup requests & manage approved accounts
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-olive-800 border border-olive-700 text-olive-300 text-xs font-mono hover:bg-olive-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-400">Error</p>
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-400">Success</p>
              <p className="text-xs text-emerald-300">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-900/80 to-olive-950 border border-amber-500/40 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{queue.length}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/60 to-olive-950 border border-emerald-500/40 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Approved Personnel</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{approvedUsers.length}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">Admin Status</span>
            <Shield className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-lg font-black text-emerald-400">ACTIVE</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-olive-900/50 border border-olive-700/40">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              : 'text-olive-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Review
          {queue.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px]">
              {queue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'approved'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : 'text-olive-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Approved Personnel
          {approvedUsers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px]">
              {approvedUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-olive-400">Loading data...</p>
        </div>
      ) : activeTab === 'pending' ? (
        /* ───── PENDING REVIEW TAB ───── */
        queue.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-olive-900/50 border border-olive-700/40">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-white mb-1">All Caught Up</p>
            <p className="text-sm text-olive-400">No pending signup requests in the review queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl bg-olive-900/70 border border-olive-700/60 p-5 shadow-xl"
              >
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-olive-800">
                      <Mail className="w-4 h-4 text-olive-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{request.email}</p>
                      <p className="text-[10px] text-olive-500 font-mono">
                        {request.full_name || 'No name provided'} • {request.rank || 'Officer'} • {request.force || 'CRPF'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${getRoleBadgeColor(request.role || 'personnel')}`}>
                    {(request.role || 'personnel').toUpperCase()}
                  </span>
                </div>

                {/* Credentials Audit */}
                <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40 mb-4">
                  <div className="flex items-center justify-between mb-3 border-b border-olive-800/60 pb-2">
                    <h4 className="text-xs font-mono text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-accent-gold" />
                      <span>Submitted Credentials & Clearance Profile</span>
                    </h4>
                    <span className="text-[10px] font-mono text-olive-400">
                      Node: <strong className="text-white">CAPF-NODE-{request.id.slice(0, 5).toUpperCase()}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Full Name</p>
                      <p className="text-xs font-bold text-white">{request.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Registered Email</p>
                      <p className="text-xs font-bold text-emerald-300 font-mono truncate">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Military Service ID</p>
                      <p className="text-xs font-bold text-accent-gold font-mono">{request.service_id || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Force & Branch</p>
                      <p className="text-xs font-bold text-white">{request.force || 'CRPF'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Military Rank</p>
                      <p className="text-xs font-bold text-white">{request.rank || 'Officer'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Assigned Unit</p>
                      <p className="text-xs font-bold text-white truncate">{request.unit || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Command Role</p>
                      <p className="text-xs font-bold text-cyan-300 capitalize">{(request.role || 'personnel').replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Department / Designation</p>
                      <p className="text-xs font-bold text-white truncate">{request.designation || request.department || 'Operations'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Submitted At</p>
                      <p className="text-xs font-mono text-olive-300">
                        {request.submitted_at ? new Date(request.submitted_at).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  {/* Password Audit */}
                  <div className="mt-3 pt-2.5 border-t border-olive-800/40 flex items-center justify-between bg-olive-900/40 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-mono text-olive-300">Submitted Password Credential:</span>
                      <span className="font-mono text-xs font-bold text-accent-gold tracking-wider">
                        {showPasswords[request.id]
                          ? ((request as any).password_plain || 'Protected / Hash Encrypted')
                          : '••••••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          [request.id]: !prev[request.id],
                        }))
                      }
                      className="flex items-center gap-1 text-[11px] font-mono text-olive-400 hover:text-white px-2 py-0.5 rounded bg-olive-800/60 transition-colors"
                    >
                      {showPasswords[request.id] ? (
                        <><EyeOff className="w-3 h-3" /><span>Hide</span></>
                      ) : (
                        <><Eye className="w-3 h-3" /><span>Reveal</span></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Review Notes */}
                <div className="mb-4">
                  <label className="block text-xs font-mono text-olive-400 mb-2">
                    Review Notes <span className="text-rose-400">(required for rejection)</span>
                  </label>
                  <textarea
                    value={reviewNotes[request.id] || ''}
                    onChange={(e) => setReviewNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
                    placeholder="Enter your review notes..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-olive-950 border border-olive-700/60 text-white text-sm font-mono placeholder:text-olive-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    {processing === request.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    {processing === request.id ? 'Approving...' : 'Approve & Create Account'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* ───── APPROVED PERSONNEL TAB ───── */
        approvedUsers.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-olive-900/50 border border-olive-700/40">
            <Users className="w-12 h-12 text-olive-400 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-bold text-white mb-1">No Approved Personnel Yet</p>
            <p className="text-sm text-olive-400">Once you approve signup requests, approved accounts appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Info Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-mono">
                All personnel below have been approved. They can now login using their <strong>registered email + password</strong> or <strong>Service ID + password</strong>.
              </p>
            </div>
            {approvedUsers.map((u, idx) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl bg-emerald-900/20 border border-emerald-500/30 p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{u.full_name}</p>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(u.role || 'personnel')}`}>
                      {(u.role || 'personnel').toUpperCase()}
                    </span>
                    {u.auth_user_id && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        AUTH ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-emerald-300 font-mono">{u.email}</span>
                    {u.service_id && (
                      <span className="text-[10px] text-accent-gold font-mono">{u.service_id}</span>
                    )}
                    <span className="text-[10px] text-olive-500 font-mono">{u.rank} • {u.force}{u.unit ? ` • ${u.unit}` : ''}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-olive-500 font-mono">Approved</p>
                  <p className="text-[10px] text-olive-400 font-mono">
                    {u.approved_at ? new Date(u.approved_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-olive-600 shrink-0" />
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
