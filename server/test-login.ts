import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testLogin() {
  console.log('Testing login with co@veerwell.org...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'co@veerwell.org',
    password: 'co-password-2026',
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
  } else {
    console.log('✅ Login successful! Session user ID:', data.user.id);
    console.log('Access token received:', data.session.access_token.slice(0, 30) + '...');
  }
}

testLogin();
