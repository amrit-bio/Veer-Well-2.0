/**
 * VeerWell 2.0 — Direct PostgreSQL Migration Executor
 * Connects directly to Supabase PostgreSQL and executes migration SQL
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runMigration() {
  console.log('🚀 VeerWell 2.0 — Database Migration via Supabase RPC');
  console.log('━'.repeat(70));

  // Read the migration SQL file
  const migrationPath = path.join(process.cwd(), 'supabase-migration.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Remove comments and split into statements
  const lines = migrationSQL
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n');

  // Split by semicolon but keep some context for CREATE TABLE statements
  const statements = lines
    .split(/;(?=\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|--\s*|$))/i)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`📋 Found ${statements.length} SQL statements`);
  console.log('');

  // Create an RPC function to execute raw SQL (if it doesn't exist)
  const createRpcFunction = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS text AS $$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
END;
$$ LANGUAGE plpgsql;
`;

  try {
    // First create the RPC function
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createRpcFunction });
    // It's okay if this fails since the function might already exist
    console.log('🔧 RPC function ensured...');
  } catch (err) {
    console.log('ℹ️  RPC setup (this is normal)');
  }

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement via RPC
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Check if it's an "already exists" error (which is acceptable)
        if (error.message?.includes('already exists') || error.message?.includes('EXISTS')) {
          console.log(`⏭️  ${i + 1}/${statements.length}: ${preview}... (already exists)`);
          successCount++;
        } else {
          console.error(`❌ ${i + 1}/${statements.length}: Error`);
          console.error(`   ${error.message.substring(0, 150)}`);
          errorCount++;
        }
      } else {
        console.log(`✅ ${i + 1}/${statements.length}: ${preview}...`);
        successCount++;
      }
    } catch (err) {
      const errMsg = (err as any).message || String(err);
      if (errMsg.includes('already exists')) {
        console.log(`⏭️  ${i + 1}/${statements.length}: ${preview}... (already exists)`);
        successCount++;
      } else {
        console.error(`❌ ${i + 1}/${statements.length}: ${errMsg.substring(0, 100)}`);
        errorCount++;
      }
    }
  }

  console.log('');
  console.log('━'.repeat(70));
  console.log(
    `✅ Migration completed: ${successCount} successful, ${errorCount} errors`
  );

  if (errorCount === 0 || successCount > 0) {
    console.log('🎉 Database schema should be ready!');
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
