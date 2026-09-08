/**
 * वीरWell (Rakshak AI) — Signup Verification Pipeline Types
 */

export type AIStatus = 'pending' | 'clean' | 'flagged' | 'rejected';
export type ReviewStatus = 'awaiting_review' | 'approved' | 'rejected';

export interface MHACredential {
  id: string;
  service_id: string;
  full_name: string;
  designation: string;
  department: string;
  issued_at: string;
  is_active: boolean;
  created_at: string;
}

export interface SignupRequest {
  id: string;
  service_id: string;
  email: string;
  full_name?: string;
  rank?: string;
  force?: string;
  unit?: string;
  role?: string;
  department?: string;
  designation?: string;
  submitted_at: string;
  ai_status: AIStatus;
  ai_reason?: string;
  ai_confidence?: number;
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  mha_credentials?: MHACredential;
}

export interface ApprovedUser {
  id: string;
  signup_request_id: string;
  service_id: string;
  email: string;
  approved_at: string;
  approved_by: string;
}

export interface SignupVerificationResponse {
  message?: string;
  status?: 'awaiting_review' | 'rejected';
  request_id?: string;
  credential?: {
    service_id: string;
    full_name: string;
    designation: string;
    department: string;
  };
  error?: string;
  ai_status?: AIStatus;
}

export interface ReviewQueueResponse {
  requests: SignupRequest[];
}

export interface ReviewActionResponse {
  message: string;
  request_id: string;
  approved?: boolean;
  rejected?: boolean;
}
