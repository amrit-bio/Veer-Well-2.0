/**
 * वीरWell (Rakshak AI) — Signup Verification API Service
 */

import type { SignupVerificationResponse, ReviewQueueResponse, ReviewActionResponse } from './types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

function getApiUrl(path: string): string {
  if (API_BASE && API_BASE.startsWith('http')) {
    return `${API_BASE}${path}`;
  }
  return `http://localhost:5000${path}`;
}

/**
 * Submit signup for verification (AI Gate)
 */
export async function submitSignupForVerification(
  serviceId: string,
  email: string
): Promise<SignupVerificationResponse> {
  const response = await fetch(getApiUrl('/api/auth/signup/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      email,
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Get review queue for MHA reviewers (Human Gate)
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
  return data;
}
