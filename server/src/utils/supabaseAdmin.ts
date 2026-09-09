import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('[MHA] Supabase Admin NOT configured — set SUPABASE_URL and SUPABASE_SECRET_KEY');
}

export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`[MHA] Supabase Admin initialized: ${SUPABASE_URL}`);