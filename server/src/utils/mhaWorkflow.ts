import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabaseAdmin } from './supabaseAdmin.js';

// ── Encryption helpers (AES-256-GCM for PII at rest) ──
const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY || crypto.scryptSync(process.env.JWT_SECRET || 'dev', 'salt', 32);
const ALGORITHM = 'aes-256-gcm';

function encryptPII(plaintext: string): string {
  if (!plaintext) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

function decryptPII(ciphertext: string): string {
  if (!ciphertext) return '';
  const [ivHex, authTag, data] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ── Audit logger ──
async function auditLog(
  action: string,
  description: string,
  userId: string | null,
  adminId: string | null,
  req: Request,
  metadata: Record<string, any> = {}
) {
  try {
    await supabaseAdmin.from('mha_audit_log').insert({
      action,
      description,
      user_id: userId,
      admin_id: adminId,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      metadata,
    });
  } catch (e) {
    console.error('[MHA Audit] Failed to write audit log:', e);
  }
}

// ── Password hashing (bcrypt) ──
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Email validation (gov.in / nic.in) ──
function isValidGovEmail(email: string): boolean {
  return /@(\w+\.)?(gov\.in|nic\.in)$/i.test(email);
}

// ── MFA TOTP generation ──
function generateOTPSecret(): string {
  return crypto.randomBytes(20).toString('base64');
}

function generateOTP(secret: string): string {
  const counter = Math.floor(Date.now() / 30000);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const otp = ((hash.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
  return otp;
}

// ── Session management ──
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

async function createSession(userId: string, req: Request): Promise<string> {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);
  await supabaseAdmin.from('mha_sessions').insert({
    user_id: userId,
    refresh_token: refreshToken,
    expires_at: expiresAt.toISOString(),
    ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress,
    user_agent: req.headers['user-agent'],
  });
  return refreshToken;
}

async function validateSession(refreshToken: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('mha_sessions')
    .select('*, mha_users(*)')
    .eq('refresh_token', refreshToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function revokeSession(refreshToken: string) {
  await supabaseAdmin.from('mha_sessions').delete().eq('refresh_token', refreshToken);
}

async function revokeAllSessions(userId: string) {
  await supabaseAdmin.from('mha_sessions').delete().eq('user_id', userId);
}

// ── Notification sender ──
async function sendNotification(
  userId: string,
  type: string,
  channel: 'EMAIL' | 'SMS',
  recipient: string,
  subject: string,
  body: string
) {
  try {
    await supabaseAdmin.from('mha_notifications').insert({
      user_id: userId,
      type,
      channel,
      recipient,
      subject,
      body,
      status: 'PENDING',
    });
    // In production, integrate with SendGrid / Twilio here
    await supabaseAdmin.from('mha_notifications')
      .update({ status: 'SENT', sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('type', type)
      .eq('status', 'PENDING');
  } catch (e) {
    console.error('[MHA Notification] Failed:', e);
  }
}

export {
  encryptPII,
  decryptPII,
  hashPassword,
  verifyPassword,
  isValidGovEmail,
  generateOTPSecret,
  generateOTP,
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
  auditLog,
  sendNotification,
  SESSION_TIMEOUT_MS,
};