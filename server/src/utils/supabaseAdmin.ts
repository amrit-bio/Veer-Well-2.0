import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading environment variables from .env or .env.vercel if not present
dotenv.config();

const parentVercelEnv = path.resolve(process.cwd(), '../.env.vercel');
if ((!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) && fs.existsSync(parentVercelEnv)) {
  dotenv.config({ path: parentVercelEnv });
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://krshfwuqifaxecbtrxmy.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || 'placeholder_dummy_key_not_configured';

export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (process.env.SUPABASE_SECRET_KEY) {
  console.log(`[MHA] Supabase Admin initialized: ${SUPABASE_URL}`);
} else {
  console.warn('[MHA] Supabase Admin running with placeholder key (missing SUPABASE_SECRET_KEY)');
}