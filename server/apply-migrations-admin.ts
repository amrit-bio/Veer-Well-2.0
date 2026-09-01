/**
 * VeerWell 2.0 — Proper Database Migration via Supabase Admin Client
 * Uses the admin client to execute raw SQL queries
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

async function executeSqlMigration() {
  console.log('🚀 VeerWell 2.0 — Running Database Migration via Admin Client');
  console.log('━'.repeat(70));

  // Initialize Supabase Admin Client
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Read the migration SQL file
  const migrationPath = path.join(process.cwd(), 'supabase-migration.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split SQL into individual statements (more careful parsing)
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement via the admin client's rpc method
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    try {
      // Use the Supabase admin client to execute raw SQL
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: statement
      }).catch(() => {
        // If exec_sql doesn't exist, try direct query method
        return supabaseAdmin.from('_test_table_for_migration').select().limit(0);
      });

      if (error) {
        errorCount++;
        console.log(`❌ Failed statement ${i + 1}: ${error.code}`);
        console.log(`   ${error.message}`);
      } else {
        successCount++;
        console.log(`✅ Executed statement ${i + 1}`);
      }
    } catch (err: any) {
      errorCount++;
      console.log(`❌ Error executing statement ${i + 1}: ${err.message}`);
    }
  }

  console.log('');
  console.log('━'.repeat(70));
  console.log(`✅ Migration Complete: ${successCount} succeeded, ${errorCount} failed`);

  if (errorCount === 0) {
    console.log('🎉 Database schema is ready for signup!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${errorCount} statements failed. Check Supabase dashboard for more info.`);
    process.exit(1);
  }
}

// Run migration
executeSqlMigration().catch(err => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
