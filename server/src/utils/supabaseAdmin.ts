import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables in priority order:
// 1. server/.env.local (highest priority, git-ignored, dev overrides)
// 2. server/.env
// 3. ../.env.vercel (root-level Vercel env file)
const serverEnvLocal = path.resolve(process.cwd(), '.env.local');
const serverEnv = path.resolve(process.cwd(), '.env');
const parentVercelEnv = path.resolve(process.cwd(), '../.env.vercel');

// Load in reverse priority (later loads override earlier)
if (fs.existsSync(parentVercelEnv)) dotenv.config({ path: parentVercelEnv });
if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv, override: true });
if (fs.existsSync(serverEnvLocal)) dotenv.config({ path: serverEnvLocal, override: true });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://krshfwuqifaxecbtrxmy.supabase.co';
// Support both JWT format (eyJ...) and new sb_secret_... format
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SECRET_KEY) {
  console.error('[MHA] ❌ SUPABASE_SECRET_KEY is not set! Signup/approve routes will fail.');
  console.error('[MHA] Set SUPABASE_SECRET_KEY in server/.env to the service_role key from Supabase Dashboard → Settings → API');
}

export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY || 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (SUPABASE_SECRET_KEY && SUPABASE_SECRET_KEY !== 'placeholder') {
  console.log(`[MHA] ✅ Supabase Admin initialized: ${SUPABASE_URL}`);
} else {
  console.warn('[MHA] ⚠️  Supabase Admin running without valid secret key. Database writes will fail.');
}