/**
 * वीरWell (Rakshak AI) — Signup Verification Pipeline Types
 * 
 * Simple public signup + single admin review flow.
 */

export type ReviewStatus = 'awaiting_review' | 'approved' | 'rejected';

export interface SignupRequest {
  id: string;
  full_name: string;
  email: string;
  password_hash?: string;
  password_plain?: string;
  rank?: string;
  service_id?: string;
  force?: string;
  unit?: string;
  role?: string;
  department?: string;
  designation?: string;
  submitted_at: string;
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface ApprovedUser {
  id: string;
  signup_request_id: string;
  full_name: string;
  email: string;
  rank?: string;
  service_id?: string;
  force?: string;
  unit?: string;
  role?: string;
  department?: string;
  designation?: string;
  approved_at: string;
  approved_by: string;
}

export interface SignupVerificationResponse {
  message?: string;
  status?: 'awaiting_review' | 'rejected';
  request_id?: string;
  error?: string;
}

export interface ReviewQueueResponse {
  requests: SignupRequest[];
}

export interface ReviewActionResponse {
  message: string;
  request_id: string;
  approved?: boolean;
  rejected?: boolean;
  user_id?: string;
}
