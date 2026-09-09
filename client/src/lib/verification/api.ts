/**
 * वीरWell (Rakshak AI) — Signup Verification API Service
 * 
 * Simple public signup flow:
 * 1. User submits signup form -> stored in public.signup_requests as awaiting_review
 * 2. Single MHA admin reviews queue -> approves/rejects
 * 3. On approve -> Supabase Auth user / profile is created
 */

import type { SignupVerificationResponse, ReviewQueueResponse, ReviewActionResponse } from './types';
import { supabase } from '../supabaseClient';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

function getApiUrl(path: string): string {
  if (API_BASE && API_BASE.startsWith('http')) {
    return `${API_BASE}${path}`;
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost:5000')) {
      return `${origin}${path}`;
    }
  }
  return `http://localhost:5000${path}`;
}

export interface SubmitSignupData {
  full_name: string;
  email: string;
  password: string;
  rank?: string;
  service_id?: string;
  force?: string;
  unit?: string;
  role?: string;
  department?: string;
  designation?: string;
}

/**
 * Submit signup for MHA admin review.
 *
 * Strategy (most-reliable-first):
 *  1. Write directly to Supabase `signup_requests` using the anon key.
 *     ➜ This works as long as the table exists + INSERT policy allows it.
 *  2. After success, best-effort POST to the server API for additional processing
 *     (e.g. sending notifications). Failure here does NOT affect the user.
 */
export async function submitSignupForVerification(
  data: SubmitSignupData
): Promise<SignupVerificationResponse> {
  const cleanEmail = data.email.trim().toLowerCase();

  // ── STEP 1: Direct Supabase INSERT (primary, reliable) ────────────────────
  const { error: dbError } = await supabase
    .from('signup_requests')
    .insert({
      full_name:    data.full_name.trim(),
      email:        cleanEmail,
      password_plain: data.password || null,
      rank:         data.rank?.trim()        || 'Officer',
      service_id:   data.service_id?.trim()  || null,
      force:        data.force?.trim()        || 'CRPF',
      unit:         data.unit?.trim()         || null,
      role:         data.role?.trim()         || 'personnel',
      department:   data.department?.trim()   || 'Operations',
      designation:  data.designation?.trim()  || `${data.rank || 'Officer'} (${data.role || 'personnel'})`,
      review_status: 'awaiting_review',
      submitted_at: new Date().toISOString(),
    });

  if (dbError) {
    console.error('[Signup] Supabase insert error:', dbError.code, dbError.message);

    // Table doesn't exist → migration not run
    if (dbError.code === '42P01' || dbError.message?.toLowerCase().includes('does not exist')) {
      throw new Error(
        'Database not initialized. Please contact the system administrator to run the SQL migration in Supabase.'
      );
    }

    // Duplicate email → already submitted
    if (dbError.code === '23505') {
      return {
        message: 'A signup request for this email is already pending MHA Admin review. You will be notified once approved.',
        status: 'awaiting_review',
        request_id: 'duplicate',
      };
    }

    // Permission denied (RLS) → surface clearly
    if (dbError.code === '42501' || dbError.message?.toLowerCase().includes('permission denied')) {
      throw new Error(
        'Permission denied: the database security policy rejected this request. Please contact the system administrator.'
      );
    }

    // Any other DB error
    throw new Error(`Signup failed: ${dbError.message}`);
  }

  console.log('[Signup] ✅ Registration submitted for review:', cleanEmail);

  // Best-effort server notification (non-blocking)
  try {
    const serverUrl = getApiUrl('/api/auth/signup/verify');
    fetch(serverUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
      signal:  AbortSignal.timeout(5000),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return {
    message: 'Your registration has been submitted for MHA Admin review. You will be notified once your account is approved.',
    status: 'awaiting_review',
    request_id: `pending-${Date.now()}`,
  };
}

/**
 * Get review queue for MHA admin
 */
export async function getReviewQueue(): Promise<ReviewQueueResponse> {
  // Primary: Try HTTP API endpoint
  try {
    const response = await fetch(getApiUrl('/api/admin/review-queue'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const resData = await response.json();
      const list = resData.requests || resData.queue || [];
      return {
        requests: list,
        queue: list,
        total: list.length,
      } as any;
    }
  } catch (err: any) {
    console.warn('[Review Queue] API fetch failed, falling back to RPC:', err.message);
  }

  // Fallback 1: Call SECURITY DEFINER RPC function (bypasses RLS, works with anon key)
  try {
    const { data, error } = await supabase.rpc('get_pending_signups');
    if (!error && data) {
      const list = (data as any[]) || [];
      return {
        requests: list,
        queue: list,
        total: list.length,
      } as any;
    }
    if (error) {
      console.error('[Review Queue] RPC error:', error.code, error.message);
    }
  } catch (sbErr) {
    console.error('[Review Queue] RPC fallback error:', sbErr);
  }

  // Fallback 2: Direct Supabase query on signup_requests
  try {
    const { data: directRows } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('review_status', 'awaiting_review')
      .order('submitted_at', { ascending: true });

    if (directRows && directRows.length > 0) {
      return {
        requests: directRows,
        queue: directRows,
        total: directRows.length,
      } as any;
    }
  } catch (directErr) {
    console.warn('[Review Queue] Direct table fallback note:', directErr);
  }

  return { requests: [], queue: [], total: 0 } as any;
}

/**
 * Approve a signup request
 */
export async function approveSignupRequest(
  requestId: string,
  reviewerId: string,
  reviewNotes?: string
): Promise<ReviewActionResponse> {
  // Primary: Try HTTP API endpoint
  try {
    const response = await fetch(getApiUrl('/api/admin/approve'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        reviewer_id: reviewerId,
        review_notes: reviewNotes,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.warn('[Approve Request] Server returned error:', data.error || response.statusText);
    }
  } catch (err: any) {
    console.warn('[Approve Request] API call failed, attempting direct Supabase approval:', err.message);
  }

  // Fallback 1: Call SECURITY DEFINER RPC function
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('approve_signup_request', {
      p_request_id: requestId,
      p_reviewer_id: reviewerId || 'usr-admin-00',
      p_review_notes: reviewNotes || 'Approved by MHA Admin',
    });

    if (!rpcError) {
      console.log('[Approve Request] ✅ RPC approve_signup_request succeeded:', rpcData);
      return {
        message: 'Signup request approved successfully via database function.',
        request_id: requestId,
        approved: true,
      };
    } else {
      console.warn('[Approve Request] RPC approve_signup_request error:', rpcError.message);
    }
  } catch (rpcCatchErr: any) {
    console.warn('[Approve Request] RPC invocation failed:', rpcCatchErr.message);
  }

  // Fallback 2: Direct Supabase update
  try {
    await supabase
      .from('signup_requests')
      .update({
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        review_notes: reviewNotes || 'Approved by MHA Admin',
      })
      .eq('id', requestId);

    // Fetch details for profile creation
    const { data: reqData } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqData) {
      const targetEmail = (reqData as any).email;
      const targetName = (reqData as any).full_name || targetEmail.split('@')[0];
      const profileId = (reqData as any).service_id || `usr-${Date.now()}`;

      await supabase.from('profiles').upsert({
        id: profileId,
        name: targetName,
        email: targetEmail,
        rank: (reqData as any).rank || 'Officer',
        service_number: (reqData as any).service_id,
        force: (reqData as any).force || 'CRPF',
        unit: (reqData as any).unit || '142 Bn',
        role: (reqData as any).role || 'personnel',
        role_title: (reqData as any).designation || `${(reqData as any).rank || 'Officer'} (${(reqData as any).role || 'personnel'})`,
        department: (reqData as any).department || 'Operations',
        designation: (reqData as any).designation || `${(reqData as any).rank || 'Officer'} (${(reqData as any).role || 'personnel'})`,
        anonymized_id: `CAPF-NODE-${profileId.slice(0, 5).toUpperCase()}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        location: `${(reqData as any).unit || 'HQ'}, ${(reqData as any).force || 'CRPF'}`,
        updated_at: new Date().toISOString(),
      });
    }

    return {
      message: 'Signup request approved successfully.',
      request_id: requestId,
      approved: true,
    };
  } catch (fallbackErr: any) {
    throw new Error(`Failed to approve request: ${fallbackErr.message || 'Unknown error'}`);
  }
}

/**
 * Reject a signup request
 */
export async function rejectSignupRequest(
  requestId: string,
  reviewerId: string,
  reviewNotes: string
): Promise<ReviewActionResponse> {
  // Primary: Try HTTP API endpoint
  try {
    const response = await fetch(getApiUrl('/api/admin/reject'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        reviewer_id: reviewerId,
        review_notes: reviewNotes,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    }
  } catch (err: any) {
    console.warn('[Reject Request] API call failed, attempting direct Supabase rejection:', err.message);
  }

  // Fallback 1: Call SECURITY DEFINER RPC function
  try {
    const { error: rpcError } = await supabase.rpc('reject_signup_request', {
      p_request_id: requestId,
      p_reviewer_id: reviewerId || 'usr-admin-00',
      p_review_notes: reviewNotes || 'Rejected by MHA Admin',
    });

    if (!rpcError) {
      return {
        message: 'Signup request rejected.',
        request_id: requestId,
        approved: false,
      };
    }
  } catch (rpcCatchErr) {
    // Non-blocking
  }

  // Fallback 2: Direct Supabase update
  try {
    await supabase
      .from('signup_requests')
      .update({
        review_status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        review_notes: reviewNotes,
      })
      .eq('id', requestId);

    return {
      message: 'Signup request rejected.',
      request_id: requestId,
      approved: false,
    };
  } catch (fallbackErr: any) {
    throw new Error(`Failed to reject request: ${fallbackErr.message || 'Unknown error'}`);
  }
}

export interface ApprovedUser {
  id: string;
  signup_request_id?: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  rank: string;
  service_id?: string;
  force: string;
  unit?: string;
  role: string;
  department?: string;
  designation?: string;
  approved_at: string;
  approved_by?: string;
  approval_notes?: string;
  account_active: boolean;
}

/**
 * Get the list of all approved users (admin dashboard)
 */
export async function getApprovedUsers(): Promise<{ approved_users: ApprovedUser[] }> {
  // Primary: HTTP API endpoint
  try {
    const response = await fetch(getApiUrl('/api/admin/approved-users'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err: any) {
    console.warn('[Approved Users] API fetch failed, trying RPC fallback:', err.message);
  }

  // Fallback: Call SECURITY DEFINER RPC function (bypasses RLS, works with anon key)
  try {
    const { data, error } = await supabase.rpc('get_approved_personnel');
    if (!error && data) {
      return { approved_users: data as ApprovedUser[] };
    }
    if (error) {
      console.error('[Approved Users] RPC error:', error.code, error.message);
    }
  } catch (sbErr) {
    console.error('[Approved Users] RPC fallback error:', sbErr);
  }

  return { approved_users: [] };
}

/**
 * Check if a given email or service ID has been approved by MHA admin.
 * Used by the login flow to resolve service IDs to email accounts.
 */
export async function checkApprovedUser(identifier: string): Promise<{
  found: boolean;
  approved: boolean;
  email?: string;
  service_id?: string;
  auth_user_id?: string;
  role?: string;
  full_name?: string;
  rank?: string;
  force?: string;
  unit?: string;
}> {
  // Primary: HTTP API endpoint
  try {
    const response = await fetch(getApiUrl(`/api/admin/check-approved-user?identifier=${encodeURIComponent(identifier)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err: any) {
    console.warn('[Check Approved User] API fetch failed, trying RPC fallback:', err.message);
  }

  // Fallback 1: SECURITY DEFINER RPC function (bypasses RLS, fast & safe)
  try {
    const { data: rpcRows, error: rpcErr } = await supabase.rpc('check_approved_personnel', {
      p_identifier: identifier.trim(),
    });
    if (!rpcErr && rpcRows && rpcRows.length > 0) {
      const row = rpcRows[0];
      return {
        found: true,
        approved: row.approved ?? true,
        email: row.email,
        service_id: row.service_id,
        auth_user_id: row.auth_user_id,
        role: row.role,
        full_name: row.full_name,
        rank: row.rank,
        force: row.force,
        unit: row.unit,
      };
    }
  } catch (rpcErr: any) {
    console.warn('[Check Approved User] RPC fallback error:', rpcErr?.message);
  }

  // Fallback 2: Direct Supabase query
  try {
    const clean = identifier.trim().toLowerCase();
    const { data } = await supabase
      .from('approved_users')
      .select('id, email, service_id, auth_user_id, role, full_name, rank, force, unit, account_active')
      .or(`email.ilike.${clean},service_id.ilike.${clean}`)
      .eq('account_active', true)
      .maybeSingle();

    if (data) {
      return {
        found: true,
        approved: true,
        email: (data as any).email,
        service_id: (data as any).service_id,
        auth_user_id: (data as any).auth_user_id,
        role: (data as any).role,
        full_name: (data as any).full_name,
        rank: (data as any).rank,
        force: (data as any).force,
        unit: (data as any).unit,
      };
    }
  } catch (sbErr) {
    console.warn('[Check Approved User] Supabase direct fallback error:', sbErr);
  }

  return { found: false, approved: false };
}
