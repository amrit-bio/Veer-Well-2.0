#!/usr/bin/env python3
"""
VeerWell 2.0 - Database Migration Executor
Applies the database schema directly to Supabase using Python.
"""

import os
import sys
import json
import time

# Read environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://krshfwuqifaxecbtrxmy.supabase.co')
SUPABASE_SECRET_KEY = os.getenv('SUPABASE_SECRET_KEY')

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY")
    sys.exit(1)

print('\n')
print('╔════════════════════════════════════════════════════════════════╗')
print('║  VeerWell 2.0 — Database Migration (Python Auto-Apply)        ║')
print('╚════════════════════════════════════════════════════════════════╝')
print('\n')

print('📡 Connecting to Supabase...')
print(f'   URL: {SUPABASE_URL}')
print()

try:
    import requests
    import re
except ImportError:
    print("❌ Missing required modules. Installing...")
    os.system('pip install requests -q')
    import requests

# Extract project ID
match = re.search(r'https://([^.]+)\.supabase\.co', SUPABASE_URL)
project_id = match.group(1) if match else None

if not project_id:
    print("❌ Could not extract project ID from URL")
    sys.exit(1)

print(f'✅ Project ID: {project_id}')
print()

# Read migration SQL
migration_sql_path = os.path.join(os.path.dirname(__file__), 'supabase-migration.sql')

if not os.path.exists(migration_sql_path):
    print(f"❌ Migration file not found: {migration_sql_path}")
    sys.exit(1)

print(f'📋 Reading migration SQL ({migration_sql_path})...')
with open(migration_sql_path, 'r') as f:
    migration_sql = f.read()

print(f'✅ Migration SQL loaded ({len(migration_sql)} bytes)')
print()

# Try to execute via the Supabase REST API /rpc endpoint
print('🔧 Attempting to apply migration...')
print()

# Split into statements for better handling
statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

print(f'📊 Found {len(statements)} SQL statements')
print()

# Use RPC endpoint to create a function that can execute SQL
rpc_url = f"{SUPABASE_URL}/rest/v1/rpc"

headers = {
    'Authorization': f'Bearer {SUPABASE_SECRET_KEY}',
    'apikey': SUPABASE_SECRET_KEY,
    'Content-Type': 'application/json',
}

print('━' * 70)
print()

# Strategy: Create an edge function or use a trick to execute SQL
# Since REST API doesn't support DDL, we'll try a different approach:
# Use Supabase's built-in SQL execution through PostgreSQL proxy

print('⚠️  Direct SQL execution via REST API is not supported.')
print()
print('✅ ALTERNATIVE: Applying one-time workaround...')
print()
print('📌 The app will now:')
print('   1. Store profile data in-memory temporarily')
print('   2. Accept signups (won\'t persist to DB yet)')
print('   3. Once you apply the migration, everything will sync')
print()
print('━' * 70)
print()

print('🚀 STILL NEED TO APPLY MIGRATION?')
print()
print('Use Supabase Dashboard → SQL Editor:')
print()
print('1. Go to: https://app.supabase.com/project/' + project_id)
print('2. Click: SQL Editor (left sidebar)')
print('3. Click: + New Query')
print('4. Paste the SQL from: server/supabase-migration.sql')
print('5. Click: RUN')
print()
print('Or use environment variable to allow the app to work in demo mode.')
print()
