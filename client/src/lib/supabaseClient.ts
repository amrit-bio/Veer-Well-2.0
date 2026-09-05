import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const IS_CONFIGURED = !!(supabaseUrl && supabaseAnonKey);

if (!IS_CONFIGURED) {
  console.warn('[VeerWell] Secure authentication not configured. Operating in offline mode.');
}

function makeStubClient(): SupabaseClient {
  const noop = () => {};
  const emptyResult = { data: [], error: null };
  const nullSession = { data: { session: null }, error: null };
  const authError = { data: null, error: new Error('Authentication service not available') };

  const stubTableQuery: any = {
    select: () => Promise.resolve(emptyResult),
    insert: () => Promise.resolve(emptyResult),
    upsert: () => Promise.resolve(emptyResult),
    update: () => Promise.resolve(emptyResult),
    delete: () => Promise.resolve(emptyResult),
    eq: () => stubTableQuery,
    neq: () => stubTableQuery,
    gte: () => stubTableQuery,
    lte: () => stubTableQuery,
    like: () => stubTableQuery,
    ilike: () => stubTableQuery,
    order: () => stubTableQuery,
    limit: () => Promise.resolve(emptyResult),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  };

  return {
    from: () => stubTableQuery,
    channel: () => ({
      on: () => ({ subscribe: noop, unsubscribe: noop }),
      subscribe: noop,
      unsubscribe: noop,
    }),
    removeChannel: noop,
    auth: {
      getSession: () => Promise.resolve(nullSession),
      signInWithPassword: () => Promise.resolve(authError),
      signUp: () => Promise.resolve(authError),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      verifyOtp: () => Promise.resolve({ error: null }),
      onAuthStateChange: (cb: any) => { cb('SIGNED_OUT', null); return { data: { subscription: { unsubscribe: noop } }, error: null }; },
    },
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = IS_CONFIGURED
  ? createClient(supabaseUrl, supabaseAnonKey)
  : makeStubClient();

export const isSupabaseReady = (): boolean => IS_CONFIGURED;
