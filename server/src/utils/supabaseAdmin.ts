import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

export const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

if (supabaseAdmin) {
  console.log(`[MHA] Supabase Admin initialized: ${SUPABASE_URL}`);
} else {
  console.warn('[MHA] Supabase Admin NOT configured — set SUPABASE_URL and SUPABASE_SECRET_KEY');
}