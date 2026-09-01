/**
 * VeerWell 2.0 — Direct Supabase Migration Executor
 * Executes raw SQL via Supabase's sql function endpoint
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

async function executeSqlMigration() {
  console.log('🚀 VeerWell 2.0 — Running Database Migration');
  console.log('━'.repeat(70));

  // Read the migration SQL file
  const migrationPath = path.join(process.cwd(), 'supabase-migration.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const tableMatch = statement.match(/CREATE TABLE[^(]*\(\s*([a-z_]+)/i);
    const tableName = tableMatch ? tableMatch[1] : `statement ${i + 1}`;

    try {
      // Use Supabase's SQL query endpoint
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SECRET_KEY!,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY!}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            query: statement,
          }),
        }
      );

      if (response.ok) {
        console.log(`✅ Created: ${tableName}`);
        successCount++;
      } else {
        const errorText = await response.text();
        // Some "errors" are expected (like IF NOT EXISTS on already-created tables)
        if (errorText.includes('already exists') || errorText.includes('EXISTS')) {
          console.log(`⏭️  Skipped: ${tableName} (already exists)`);
          successCount++;
        } else {
          console.error(`❌ Failed ${tableName}: ${response.status}`);
          console.error(`   ${errorText.substring(0, 200)}`);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`❌ Error executing ${tableName}:`, (err as Error).message);
      errorCount++;
    }
  }

  console.log('');
  console.log('━'.repeat(70));
  console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} errors`);

  if (errorCount === 0) {
    console.log('🎉 Database schema is ready! Signup should now work.');
  }
}

executeSqlMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
