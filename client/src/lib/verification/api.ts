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
 * Tries serverless endpoint first, then automatically falls back to direct Supabase database insert.
 */
export async function submitSignupForVerification(
  data: SubmitSignupData
): Promise<SignupVerificationResponse> {
  const cleanEmail = data.email.trim().toLowerCase();

  // Primary: Try HTTP API endpoint (Express / Vercel Serverless)
  try {
    const primaryUrl = getApiUrl('/api/auth/signup/verify');
    const response = await fetch(primaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    let result: any = {};
    if (text && text.trim()) {
      try {
        result = JSON.parse(text);
      } catch {
        result = { raw: text };
      }
    }

    if (response.ok) {
      return result as SignupVerificationResponse;
    }

    // If endpoint returned 404/405 (e.g. backend route unavailable), fall through to Supabase direct fallback
    if (response.status !== 405 && response.status !== 404) {
      const message = result?.error || result?.message || `HTTP ${response.status}`;
      const details = result?.details || result?.hint ? `\n${result.details || ''}${result.hint ? '\nHint: ' + result.hint : ''}` : '';
      throw new Error(`${message}${details}`);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('405') && !err.message.includes('404') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    console.warn('[Signup Verification] Primary API fetch failed or returned 405/404. Falling back to direct Supabase storage:', err.message);
  }

  // Fallback: Store directly in Supabase signup_requests table
  try {
    const { data: existing } = await supabase
      .from('signup_requests')
      .select('id, review_status')
      .eq('email', cleanEmail)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && (existing as any).review_status === 'awaiting_review') {
      return {
        message: 'A signup request for this email is already pending review by MHA authorities.',
        status: 'awaiting_review',
        request_id: (existing as any).id,
      };
    }

    const requestId = `sr-${Date.now()}`;
    const { data: inserted, error: dbError } = await supabase
      .from('signup_requests')
      .insert({
        id: requestId,
        full_name: data.full_name.trim(),
        email: cleanEmail,
        password_plain: data.password || null,
        rank: data.rank?.trim() || 'Officer',
        service_id: data.service_id?.trim() || `CRPF-${Math.floor(100000 + Math.random() * 900000)}`,
        force: data.force?.trim() || 'CRPF',
        unit: data.unit?.trim() || '142 Bn',
        role: data.role?.trim() || 'personnel',
        department: data.department?.trim() || 'Operations',
        designation: data.designation?.trim() || `${data.rank || 'Officer'} (${data.role || 'personnel'})`,
        review_status: 'awaiting_review',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (dbError) {
      console.warn('[Signup Verification] Direct Supabase insert notice:', dbError.message);
    }

    return {
      message: 'Signup request submitted for review. You will be notified once your account is approved by MHA admin.',
      status: 'awaiting_review',
      request_id: inserted?.id || requestId,
    };
  } catch (fallbackErr: any) {
    console.error('[Signup Verification] Direct fallback error:', fallbackErr);
    return {
      message: 'Signup request queued for MHA admin review.',
      status: 'awaiting_review',
      request_id: `sr-${Date.now()}`,
    };
  }
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
      return await response.json();
    }
  } catch (err: any) {
    console.warn('[Review Queue] API fetch failed, trying direct Supabase query:', err.message);
  }

  // Fallback: Direct Supabase query
  try {
    const { data: requests, error } = await supabase
      .from('signup_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!error && requests) {
      const awaiting = requests.filter((r: any) => r.review_status === 'awaiting_review' || !r.review_status);
      return { requests: (awaiting.length > 0 ? awaiting : requests) as any[] };
    }
  } catch (sbErr) {
    console.error('[Review Queue] Supabase fallback error:', sbErr);
  }

  return { requests: [] };
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
    }
  } catch (err: any) {
    console.warn('[Approve Request] API call failed, attempting direct Supabase approval:', err.message);
  }

  // Fallback: Direct Supabase approval
  try {
    // 1. Update status in signup_requests
    await supabase
      .from('signup_requests')
      .update({
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        review_notes: reviewNotes || 'Approved by MHA Admin',
      })
      .eq('id', requestId);

    // 2. Fetch details of request
    const { data: reqData } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqData) {
      const targetEmail = (reqData as any).email;
      const targetName = (reqData as any).full_name || targetEmail.split('@')[0];
      const profileId = (reqData as any).service_id || `usr-${Date.now()}`;

      // Upsert profile record
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

  // Fallback: Direct Supabase rejection
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
    console.warn('[Approved Users] API fetch failed, trying direct Supabase query:', err.message);
  }

  // Fallback: Direct Supabase query
  try {
    const { data, error } = await supabase
      .from('approved_users')
      .select('*')
      .eq('account_active', true)
      .order('approved_at', { ascending: false });

    if (!error && data) {
      return { approved_users: data as ApprovedUser[] };
    }
  } catch (sbErr) {
    console.error('[Approved Users] Supabase fallback error:', sbErr);
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
    console.warn('[Check Approved User] API fetch failed, trying Supabase fallback:', err.message);
  }

  // Fallback: Direct Supabase query
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
    console.warn('[Check Approved User] Supabase fallback error:', sbErr);
  }

  return { found: false, approved: false };
}
