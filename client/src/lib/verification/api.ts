/**
 * वीरWell (Rakshak AI) — Signup Verification API Service
 * 
 * Simple public signup flow:
 * 1. User submits signup form -> stored as awaiting_review
 * 2. Single MHA admin reviews queue -> approves/rejects
 * 3. On approve -> Supabase Auth user is created
 */

import type { SignupVerificationResponse, ReviewQueueResponse, ReviewActionResponse } from './types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && origin !== 'http://localhost:3000' && origin !== 'http://localhost:5173') {
      return `${origin}${path}`;
    }
  }
  if (API_BASE && API_BASE.startsWith('http')) {
    return `${API_BASE}${path}`;
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
 * Submit signup for admin review
 */
export async function submitSignupForVerification(
  data: SubmitSignupData
): Promise<SignupVerificationResponse> {
  const response = await fetch(getApiUrl('/api/auth/signup/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const message = result?.error || result?.message || `HTTP ${response.status}`;
    const details = result?.details || result?.hint ? `\n${result.details || ''}${result.hint ? '\nHint: ' + result.hint : ''}` : '';
    throw new Error(`${message}${details}`);
  }

  return result;
}

/**
 * Get review queue for MHA admin
 */
export async function getReviewQueue(): Promise<ReviewQueueResponse> {
  const response = await fetch(getApiUrl('/api/admin/review-queue'), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch review queue');
  }

  return response.json();
}

/**
 * Approve a signup request
 */
export async function approveSignupRequest(
  requestId: string,
  reviewerId: string,
  reviewNotes?: string
): Promise<ReviewActionResponse> {
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

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    const details = data?.details || data?.hint ? `\n${data.details || ''}${data.hint ? '\nHint: ' + data.hint : ''}` : '';
    throw new Error(`${message}${details}`);
  }

  return data;
}

/**
 * Reject a signup request
 */
export async function rejectSignupRequest(
  requestId: string,
  reviewerId: string,
  reviewNotes: string
): Promise<ReviewActionResponse> {
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

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    const details = data?.details || data?.hint ? `\n${data.details || ''}${data.hint ? '\nHint: ' + data.hint : ''}` : '';
    throw new Error(`${message}${details}`);
  }

  return data;
}
