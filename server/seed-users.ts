/**
 * VeerWell 2.0 — Seed Supabase Auth Users
 * Creates pre-confirmed users in Supabase Auth with passwords so you can log in immediately.
 *
 * Run: npx tsx seed-users.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in server/.env');
  process.exit(1);
}

// Service role client has admin privileges (createUser with auto-confirm)
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const USERS_TO_SEED = [
  {
    email: 'co@veerwell.org',
    password: 'co-password-2026',
    name: 'Col. Devendra Singh Rathore',
    rank: 'Commandant / CO',
    serviceNumber: 'CRPF-CMD-7801',
    force: 'CRPF',
    unit: '142 Bn (Srinagar Sector HQ)',
    role: 'commander',
    department: 'Operations',
    roleTitle: 'Battalion Commanding Officer',
  },
  {
    email: 'doctor@veerwell.org',
    password: 'med-password-2026',
    name: 'Dr. Aryan Verma',
    rank: 'Chief Medical & Welfare Officer',
    serviceNumber: 'CRPF-MED-8492',
    force: 'CRPF Medical Directorate',
    unit: 'Central Composite Hospital, Srinagar',
    role: 'welfare_officer',
    department: 'Healthcare & Field',
    roleTitle: 'Unit Welfare & Psychological Specialist',
  },
  {
    email: 'jawan@veerwell.org',
    password: 'jawan-password-2026',
    name: 'Inspector Vikramaditya Shrestha',
    rank: 'Inspector (Field Command)',
    serviceNumber: 'CRPF-COBRA-1042',
    force: 'CRPF',
    unit: '209 CoBRA Bn (Special Ops)',
    role: 'personnel',
    department: 'Operations',
    roleTitle: 'Tactical Reconnaissance Lead',
  },
  {
    email: 'analyst@veerwell.org',
    password: 'ana-password-2026',
    name: 'Pooja Deshmukh',
    rank: 'Lead Behavioral Data Scientist',
    serviceNumber: 'MHA-ANA-9104',
    force: 'CAPF Command',
    unit: 'HQ Directorate General (People Intelligence)',
    role: 'analyst',
    department: 'Administration',
    roleTitle: 'Workforce Stress & Fatigue Analyst',
  },
  {
    email: 'admin@veerwell.org',
    password: 'veerwell@2026',
    name: 'VeerWell System Admin',
    rank: 'System Administrator',
    serviceNumber: 'CRPF-ADM-001',
    force: 'CAPF Command',
    unit: 'Central Operations Directorate',
    role: 'commander',
    department: 'Administration',
    roleTitle: 'Chief System Administrator',
  },
];

async function seedUsers() {
  console.log('🚀 Seeding Supabase Auth Users...');
  console.log('━'.repeat(60));

  for (const u of USERS_TO_SEED) {
    try {
      console.log(`👤 Creating user: ${u.email}...`);

      // 1. Create auth user with pre-confirmed email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          name: u.name,
          rank: u.rank,
          serviceNumber: u.serviceNumber,
          force: u.force,
          unit: u.unit,
          role: u.role,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          console.log(`   ℹ️ User already exists in auth.users — updating password...`);
          // Try to get user and update password
          const { data: userList } = await supabase.auth.admin.listUsers();
          const existing = userList?.users?.find(x => x.email === u.email);
          if (existing) {
            await supabase.auth.admin.updateUserById(existing.id, {
              password: u.password,
              email_confirm: true,
            });
            console.log(`   ✅ Password updated for ${u.email}`);
          }
        } else {
          console.log(`   ❌ Auth creation error: ${authError.message}`);
        }
      } else if (authData?.user) {
        console.log(`   ✅ Created auth user with ID: ${authData.user.id}`);

        // 2. Ensure profile row exists in public.profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: u.name,
            email: u.email,
            rank: u.rank,
            service_number: u.serviceNumber,
            force: u.force,
            unit: u.unit,
            role: u.role,
            department: u.department,
            role_title: u.roleTitle,
            anonymized_id: `CAPF-NODE-${authData.user.id.slice(0, 5).toUpperCase()}`,
          });

        if (profileError) {
          console.log(`   ⚠️ Profile table upsert notice: ${profileError.message}`);
        } else {
          console.log(`   ✅ Profile linked in public.profiles`);
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Failed for ${u.email}:`, err.message);
    }
  }

  console.log('━'.repeat(60));
  console.log('🎉 Seeding complete! You can now log in with:');
  console.log('');
  for (const u of USERS_TO_SEED) {
    console.log(`  📧 Email:    ${u.email}`);
    console.log(`  🔑 Password: ${u.password}`);
    console.log(`  🎖️ Role:     ${u.name} (${u.role})`);
    console.log('');
  }
  console.log('━'.repeat(60));
}

seedUsers().catch(console.error);
