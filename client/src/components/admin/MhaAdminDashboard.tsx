import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getReviewQueue,
  approveSignupRequest,
  rejectSignupRequest,
} from '../../lib/verification/api';
import type { SignupRequest, ReviewActionResponse } from '../../lib/verification/types';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

type ActionType = 'approve' | 'reject';

interface ActionResult {
  success: boolean;
  message: string;
  data?: ReviewActionResponse;
}

export const MhaAdminDashboard: React.FC = () => {
  const { role, getMhaAdminToken } = useAuth();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionType, setActionType] = useState<ActionType>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const adminToken = getMhaAdminToken();

  const fetchQueue = async () => {
    setLoading(true);
    setLastResult(null);
    try {
      const data = await getReviewQueue();
      setRequests(data.requests || []);
    } catch (err: any) {
      setLastResult({
        success: false,
        message: err.message || 'Failed to fetch review queue.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.service_id?.toLowerCase().includes(q) ||
      r.force?.toLowerCase().includes(q) ||
      r.rank?.toLowerCase().includes(q)
    );
  });

  const handleAction = async (request: SignupRequest, type: ActionType) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionNotes('');
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;

    setProcessingId(selectedRequest.id);
    setShowActionModal(false);
    setLastResult(null);

    const reviewerId = 'usr-admin-00';

    try {
      let response: ReviewActionResponse;

      if (actionType === 'approve') {
        response = await approveSignupRequest(
          selectedRequest.id,
          reviewerId,
          actionNotes.trim() || undefined
        );
      } else {
        response = await rejectSignupRequest(
          selectedRequest.id,
          reviewerId,
          actionNotes.trim() || 'Rejected by MHA Admin'
        );
      }

      setLastResult({
        success: true,
        message: response.message || 'Action completed.',
        data: response,
      });

      // Remove the processed request from the list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
    } catch (err: any) {
      setLastResult({
        success: false,
        message: err.message || 'Action failed. Please try again.',
      });
    } finally {
      setProcessingId(null);
      setActionNotes('');
      setSelectedRequest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(text);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const isMhaAdmin = role === 'mha_admin';

  if (!isMhaAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-olive-950/90 border border-rose-500/40 shadow-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-rose-300 mb-2">Access Denied</h3>
        <p className="text-sm text-olive-300">
          MHA Admin clearance required. Sign in with MHA-ADMIN-7890 to access the review queue.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent-gold" />
            Ministry of Home Affairs — Review Queue
          </h1>
          <p className="text-sm text-olive-300 font-mono mt-1">
            {adminToken ? 'Admin token active' : 'No active admin session'} •
            {filteredRequests.length} pending request(s)
          </p>
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-olive-900/80 border border-olive-600 text-olive-200 text-xs font-mono hover:bg-olive-800 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {lastResult && (
        <div
          className={`p-4 rounded-2xl text-sm font-mono flex items-start gap-3 ${
            lastResult.success
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{lastResult.message}</div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
        <input
          type="text"
          placeholder="Search by name, email, service ID, force, or rank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-olive-900/90 border border-olive-700 text-white placeholder:text-olive-500 text-sm font-mono outline-none focus:border-accent-gold"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-olive-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Loading review queue...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-olive-400">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p>No pending registrations in the MHA review queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl bg-olive-950/80 border border-olive-800 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg">{req.full_name || 'N/A'}</h3>
                  <p className="text-sm text-olive-300 font-mono">
                    {req.email}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-600/50">
                  <span className="text-xs font-bold text-amber-300 uppercase">
                    Pending Review
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
                <div>
                  <span className="text-olive-400">Service ID:</span>{' '}
                  <span className="text-white">
                    {req.service_id || 'N/A'}
                    {req.service_id && (
                      <button
                        onClick={() => copyToClipboard(req.service_id!)}
                        className="ml-2 text-olive-500 hover:text-accent-gold transition-colors"
                      >
                        {copiedField === req.service_id ? (
                          <Check className="w-3 h-3 inline" />
                        ) : (
                          <Copy className="w-3 h-3 inline" />
                        )}
                      </button>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-olive-400">Rank:</span>{' '}
                  <span className="text-accent-gold">{req.rank || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-olive-400">Force:</span>{' '}
                  <span className="text-white">{req.force || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-olive-400">Unit:</span>{' '}
                  <span className="text-white">{req.unit || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-olive-400">Role:</span>{' '}
                  <span className="text-white">{req.role || 'personnel'}</span>
                </div>
                <div>
                  <span className="text-olive-400">Submitted:</span>{' '}
                  <span className="text-olive-200">
                    {req.submitted_at
                      ? new Date(req.submitted_at).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-olive-800">
                <button
                  onClick={() => handleAction(req, 'approve')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 font-bold text-sm hover:bg-emerald-900 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(req, 'reject')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 font-bold text-sm hover:bg-rose-900 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-olive-950 border border-olive-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'} Registration
            </h3>

            <div className="space-y-3 text-sm mb-4">
              <div>
                <span className="text-olive-400 font-mono">Name:</span>{' '}
                <span className="text-white">{selectedRequest.full_name}</span>
              </div>
              <div>
                <span className="text-olive-400 font-mono">Email:</span>{' '}
                <span className="text-white">{selectedRequest.email}</span>
              </div>
              <div>
                <span className="text-olive-400 font-mono">Service ID:</span>{' '}
                <span className="text-white">{selectedRequest.service_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-olive-400 font-mono">Force / Rank:</span>{' '}
                <span className="text-white">
                  {selectedRequest.force} / {selectedRequest.rank}
                </span>
              </div>
            </div>

            <label className="block text-xs font-bold text-olive-300 font-mono mb-1">
              Review Notes {actionType === 'reject' && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'Optional: Add approval notes...'
                  : 'Reason for rejection (required)...'
              }
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-olive-900/90 border border-olive-700 text-white placeholder:text-olive-500 text-xs font-mono outline-none focus:border-accent-gold"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-olive-900/50 border border-olive-600 text-olive-200 text-sm font-bold hover:bg-olive-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={processingId === selectedRequest.id || (actionType === 'reject' && !actionNotes.trim())}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200 hover:bg-emerald-900'
                    : 'bg-rose-950/80 border border-rose-600 text-rose-200 hover:bg-rose-900'
                }`}
              >
                {processingId === selectedRequest.id ? (
                  <>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{actionType === 'approve' ? 'Approve & Create Account' : 'Confirm Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
