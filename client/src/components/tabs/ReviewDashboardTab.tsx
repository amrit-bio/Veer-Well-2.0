/**
 * वीरWell (Rakshak AI) — MHA Review Dashboard
 * 
 * Human Gate for the signup verification pipeline.
 * Authorized MHA reviewers can approve or reject signup requests.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck, UserCheck, UserX, AlertTriangle, CheckCircle,
  Clock, Mail, Shield, FileText, RefreshCw,
} from 'lucide-react';
import {
  getReviewQueue,
  approveSignupRequest,
  rejectSignupRequest,
} from '../../lib/verification/api';
import type { SignupRequest } from '../../lib/verification/types';

export const ReviewDashboardTab: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewQueue();
      setQueue(data.requests || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;

    setProcessing(requestId);
    try {
      const result = await approveSignupRequest(requestId, user.id, reviewNotes[requestId]);
      if (result.approved) {
        setSuccess(`Signup request ${requestId.slice(0, 8)}... approved successfully`);
        setQueue((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        setError(result.message || 'Failed to approve request');
      }
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
      const result = await rejectSignupRequest(requestId, user.id, reviewNotes[requestId]);
      if (result.rejected) {
        setSuccess(`Signup request ${requestId.slice(0, 8)}... rejected`);
        setQueue((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        setError(result.message || 'Failed to reject request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-olive-400';
    if (confidence >= 0.8) return 'text-emerald-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getAIStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
      case 'flagged': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'rejected': return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      default: return 'text-olive-400 bg-olive-500/20 border-olive-500/40';
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
              <h2 className="text-2xl font-black text-white tracking-tight">MHA Review Queue</h2>
              <p className="text-xs text-olive-400 font-mono ml-8">
                Human Gate — Signup Verification Pipeline
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchQueue}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-900/80 to-olive-950 border border-amber-500/40 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{queue.length}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">AI Clean</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {queue.filter((r) => r.ai_status === 'clean').length}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">AI Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {queue.filter((r) => r.ai_status === 'flagged').length}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-olive-900 to-olive-950 border border-olive-700/60 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-olive-400 uppercase">Avg Confidence</span>
            <Shield className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-3xl font-black text-white">
            {queue.length > 0
              ? Math.round(queue.reduce((sum, r) => sum + (r.ai_confidence || 0), 0) / queue.length * 100)
              : 0}
            <span className="text-sm text-olive-400">%</span>
          </div>
        </div>
      </div>

      {/* Queue */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-olive-400">Loading review queue...</p>
        </div>
      ) : queue.length === 0 ? (
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
                      {request.service_id} • {request.full_name || 'No name provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${getAIStatusColor(request.ai_status)}`}>
                    {request.ai_status.toUpperCase()}
                  </span>
                  {request.ai_confidence && (
                    <span className={`text-[10px] font-mono font-bold ${getConfidenceColor(request.ai_confidence)}`}>
                      {(request.ai_confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* MHA Credential Details */}
              {request.mha_credentials && (
                <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40 mb-4">
                  <h4 className="text-xs font-mono text-olive-400 uppercase tracking-wider mb-2">
                    MHA Credential Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Full Name</p>
                      <p className="text-xs font-bold text-white">{request.mha_credentials.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Designation</p>
                      <p className="text-xs font-bold text-white">{request.mha_credentials.designation}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Department</p>
                      <p className="text-xs font-bold text-white">{request.mha_credentials.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-olive-500 font-mono">Issued At</p>
                      <p className="text-xs font-bold text-white">{request.mha_credentials.issued_at}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Screening Details */}
              {request.ai_reason && (
                <div className="p-4 rounded-xl bg-olive-950 border border-olive-700/40 mb-4">
                  <h4 className="text-xs font-mono text-olive-400 uppercase tracking-wider mb-2">
                    AI Screening Result
                  </h4>
                  <p className="text-xs text-olive-300">{request.ai_reason}</p>
                </div>
              )}

              {/* Review Notes Input */}
              <div className="mb-4">
                <label className="block text-xs font-mono text-olive-400 mb-2">
                  Review Notes {request.ai_status === 'flagged' && <span className="text-rose-400">(required for rejection)</span>}
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
                  <UserCheck className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
