/**
 * VeerWell 2.0 — Direct PostgreSQL Migration Executor
 * Connects directly to Supabase PostgreSQL via pg client
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

// Extract host from Supabase URL
const hostMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectId = hostMatch ? hostMatch[1] : '';

if (!projectId) {
  console.error('❌ Could not extract project ID from SUPABASE_URL');
  process.exit(1);
}

// Create PostgreSQL connection string
const dbConnectionString = `postgresql://postgres:${SUPABASE_SECRET_KEY}@db.${projectId}.supabase.co:5432/postgres`;

async function runMigration() {
  const client = new Client({
    connectionString: dbConnectionString,
    application_name: 'veerwell-migration',
  });

  console.log('🚀 VeerWell 2.0 — Database Migration via PostgreSQL');
  console.log('━'.repeat(70));
  console.log(`📡 Connecting to: db.${projectId}.supabase.co`);
  console.log('');

  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    console.log('');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute the entire migration file
    console.log('📋 Executing migration SQL...');
    await client.query(migrationSQL);

    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Database schema is ready for signup!');

  } catch (error: any) {
    console.error('');
    console.error('━'.repeat(70));
    console.error('❌ Migration failed:');
    console.error('');
    console.error(`Error: ${error.message}`);
    if (error.detail) {
      console.error(`Detail: ${error.detail}`);
    }
    if (error.context) {
      console.error(`Context: ${error.context}`);
    }
    console.error('');
    process.exit(1);

  } finally {
    // Close the connection
    await client.end();
  }
}

runMigration();
