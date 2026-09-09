-- MHA Approval Workflow Schema for Supabase PostgreSQL
-- Run this in the Supabase SQL Editor to create all required tables.

-- 1. ROLES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS mha_roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE (with PII encryption, status flags, MFA)
CREATE TABLE IF NOT EXISTS mha_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    force_department TEXT NOT NULL,          -- e.g. CISF, ITBP, NSG
    service_number TEXT NOT NULL UNIQUE,
    official_email TEXT NOT NULL UNIQUE,
    mobile_number TEXT NOT NULL,
    password_hash TEXT NOT NULL,             -- bcrypt/argon2
    id_document_url TEXT,                    -- Supabase Storage path
    id_document_verified BOOLEAN DEFAULT FALSE,
    role_id INTEGER REFERENCES mha_roles(id) DEFAULT 1,
    account_status TEXT NOT NULL DEFAULT 'PENDING_MHA_APPROVAL', -- PENDING_MHA_APPROVAL, APPROVED, REJECTED, SUSPENDED
    mha_admin_id UUID REFERENCES mha_users(id),  -- who approved/rejected
    mha_remarks TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,                         -- TOTP secret
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    last_login_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUDIT LOG TABLE (compliance)
CREATE TABLE IF NOT EXISTS mha_audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES mha_users(id),
    admin_id UUID REFERENCES mha_users(id),
    action TEXT NOT NULL,                    -- LOGIN_ATTEMPT, APPROVE, REJECT, REQUEST_INFO, MFA_VERIFY
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS TABLE (strict session management)
CREATE TABLE IF NOT EXISTS mha_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mha_users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MFA OTP / CHALLENGE TABLE
CREATE TABLE IF NOT EXISTS mha_mfa_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mha_users(id) ON DELETE CASCADE,
    otp_code TEXT NOT NULL,
    channel TEXT NOT NULL,                    -- SMS, EMAIL
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATION LOG TABLE
CREATE TABLE IF NOT EXISTS mha_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES mha_users(id),
    type TEXT NOT NULL,                      -- APPROVAL, REJECTION, INFO_REQUEST, MFA
    channel TEXT NOT NULL,                   -- EMAIL, SMS
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    status TEXT DEFAULT 'PENDING',           -- PENDING, SENT, FAILED
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mha_users_status ON mha_users(account_status);
CREATE INDEX IF NOT EXISTS idx_mha_users_email ON mha_users(official_email);
CREATE INDEX IF NOT EXISTS idx_mha_audit_user ON mha_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mha_audit_admin ON mha_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_mha_audit_created ON mha_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_mha_sessions_user ON mha_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mha_sessions_expires ON mha_sessions(expires_at);

-- Seed default roles
INSERT INTO mha_roles (name, display_name, description, permissions) VALUES
    ('SUPER_ADMIN_MHA', 'MHA Super Administrator', 'Full system access including approval workflow', 
     '["users:read","users:write","approvals:approve","approvals:reject","audit:read","settings:write","notifications:send"]'),
    ('MHA_ADMIN', 'MHA Administrator', 'Can review and approve/reject registrations',
     '["users:read","approvals:approve","approvals:reject","audit:read"]'),
    ('CAPF_ADMIN', 'CAPF Force Administrator', 'Force-level admin, limited to own force',
     '["users:read","own_force:read"]'),
    ('USER', 'Approved CAPF Personnel', 'Standard user access',
     '["self:read","self:write"]')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE mha_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mha_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mha_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mha_mfa_challenges ENABLE ROW LEVEL SECURITY;