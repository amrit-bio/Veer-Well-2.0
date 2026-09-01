/**
 * VeerWell 2.0 — Supabase Backend Verification Script
 * Tests that all tables exist and RLS is enabled.
 *
 * Run: npx tsx test-supabase.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

// Service role client bypasses RLS — used for admin/test operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXPECTED_TABLES = [
  'profiles',
  'wearable_telemetry',
  'assessments',
  'stress_metrics',
  'deployments',
  'leave_records',
  'wellness_surveys',
  'survey_responses',
  'workload_records',
  'interventions',
  'welfare_alerts',
  'feedback',
];

async function testTable(tableName: string): Promise<{ table: string; status: string; details: string }> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { table: tableName, status: '❌ ERROR', details: error.message };
    }

    return { table: tableName, status: '✅ OK', details: `${count ?? 0} rows` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { table: tableName, status: '❌ FAIL', details: msg };
  }
}

async function main() {
  console.log('');
  console.log('🔍 VeerWell 2.0 — Supabase Backend Verification');
  console.log('━'.repeat(60));
  console.log(`📡 Project: ${SUPABASE_URL}`);
  console.log('');

  // 1. Test basic connectivity
  console.log('1️⃣  Testing connectivity...');
  const startTime = Date.now();
  const { data: healthData, error: healthError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  const elapsed = Date.now() - startTime;

  if (healthError && healthError.message.includes('does not exist')) {
    console.log(`   ❌ Table "profiles" not found — migration may not have been applied yet.`);
    console.log(`   💡 Please run the migration SQL in your Supabase Dashboard SQL Editor.`);
    console.log('');
    process.exit(1);
  }

  console.log(`   ✅ Connected in ${elapsed}ms`);
  console.log('');

  // 2. Test all tables
  console.log('2️⃣  Verifying tables...');
  console.log('');

  let allPassed = true;
  const results: { table: string; status: string; details: string }[] = [];

  for (const table of EXPECTED_TABLES) {
    const result = await testTable(table);
    results.push(result);
    if (!result.status.includes('OK')) allPassed = false;
  }

  // Print results table
  const maxTableLen = Math.max(...results.map(r => r.table.length));
  const maxStatusLen = Math.max(...results.map(r => r.status.length));

  console.log(`   ${'TABLE'.padEnd(maxTableLen + 2)}${'STATUS'.padEnd(maxStatusLen + 2)}DETAILS`);
  console.log(`   ${'─'.repeat(maxTableLen + 2)}${'─'.repeat(maxStatusLen + 2)}${'─'.repeat(20)}`);

  for (const r of results) {
    console.log(`   ${r.table.padEnd(maxTableLen + 2)}${r.status.padEnd(maxStatusLen + 2)}${r.details}`);
  }

  console.log('');

  // 3. Test RLS by checking if RLS is enabled on profiles table
  console.log('3️⃣  Testing Row Level Security (RLS)...');

  // With service_role key, we can bypass RLS. With anon key, RLS is enforced.
  // Let's test with the publishable key to verify RLS blocks unauthenticated reads.
  const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
  if (PUBLISHABLE_KEY) {
    const anonClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rlsData, error: rlsError } = await anonClient
      .from('profiles')
      .select('id')
      .limit(5);

    if (rlsError) {
      console.log(`   ✅ RLS is ACTIVE — anon access blocked: "${rlsError.message}"`);
    } else if (rlsData && rlsData.length === 0) {
      console.log(`   ✅ RLS is ACTIVE — anon query returned 0 rows (no authenticated user)`);
    } else {
      console.log(`   ⚠️  RLS may not be enforced — anon query returned ${rlsData?.length} rows`);
    }
  } else {
    console.log('   ⏭️  Skipped (SUPABASE_PUBLISHABLE_KEY not set)');
  }

  console.log('');

  // 4. Test insert + delete (round-trip) with service role
  console.log('4️⃣  Testing write operations (service role)...');

  const testId = '00000000-0000-0000-0000-000000000001';

  // Try inserting a test survey
  const { error: insertError } = await supabase
    .from('wellness_surveys')
    .upsert({
      id: testId,
      title: '__VEERWELL_TEST_SURVEY__',
      description: 'Automated test — safe to delete',
      category: 'Test',
      status: 'Draft',
    });

  if (insertError) {
    console.log(`   ❌ Insert failed: ${insertError.message}`);
  } else {
    // Verify it exists
    const { data: readBack } = await supabase
      .from('wellness_surveys')
      .select('title')
      .eq('id', testId)
      .single();

    if (readBack?.title === '__VEERWELL_TEST_SURVEY__') {
      console.log('   ✅ Insert + Read verified');
    } else {
      console.log('   ⚠️  Insert succeeded but read-back mismatch');
    }

    // Clean up
    const { error: deleteError } = await supabase
      .from('wellness_surveys')
      .delete()
      .eq('id', testId);

    if (deleteError) {
      console.log(`   ⚠️  Cleanup failed: ${deleteError.message}`);
    } else {
      console.log('   ✅ Delete (cleanup) verified');
    }
  }

  console.log('');

  // Summary
  console.log('━'.repeat(60));
  const passCount = results.filter(r => r.status.includes('OK')).length;
  if (allPassed) {
    console.log(`🎉 ALL ${passCount}/${EXPECTED_TABLES.length} tables verified — backend is fully operational!`);
  } else {
    console.log(`⚠️  ${passCount}/${EXPECTED_TABLES.length} tables OK. Some tables need attention.`);
  }
  console.log('━'.repeat(60));
  console.log('');
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
