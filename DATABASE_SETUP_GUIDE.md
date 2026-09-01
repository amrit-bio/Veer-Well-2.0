# VeerWell 2.0 - Database Setup Guide

## Current Status ✅

Your VeerWell app is now running in **two modes**:

### Mode 1: Local Fallback (Current) ⏳
- ✅ Signup works immediately  
- ✅ Profiles are stored **locally** in the server
- ⚠️ Data won't persist if server restarts
- ⚠️ Login with new accounts won't work yet (only seed users available)

### Mode 2: Full Production (After Migration) 🚀
- ✅ Signup works with database persistence
- ✅ All profiles saved permanently  
- ✅ Full feature access

---

## Option A: Quick Test (No Setup Needed) ⚡

Your app is **ready to test right now**:

1. Go to: http://localhost:3000
2. Click "Sign Up"  
3. Create an account with:
   - Email: test@example.com
   - Password: test123
4. **It will work!** ✅ (data stored locally)
5. Login will work, but only with pre-seeded accounts (see demo users below)

**Demo Users Available:**
- commander.singh@crpf.gov.in
- doc.patel@crpf.gov.in
- jawan.kumar@crpf.gov.in
- analyst.sharma@crpf.gov.in

---

## Option B: Full Setup (Recommended) 🎯

Apply the database migration for permanent data storage:

### Step 1: Get Your Supabase Access Token
```bash
supabase login
```
- Opens browser → Sign in with your Supabase account
- Returns to terminal when done

### Step 2: Link Your Project
```bash
cd "c:\Users\hp\OneDrive\Desktop\VeerWell 2.0"
supabase link --project-ref krshfwuqifaxecbtrxmy
```

### Step 3: Push the Migration
```bash
cd server
supabase db push
```
This will apply all tables to your remote database.

### Step 4: Verify
```bash
supabase db query --linked "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```
Should show all 10 tables:
- profiles ✅
- wearable_telemetry ✅
- assessments ✅
- stress_metrics ✅
- deployments ✅
- leave_records ✅
- wellness_surveys ✅
- survey_responses ✅
- workload_records ✅
- interventions ✅

---

## Option C: Manual SQL (Via Web UI) 📋

If CLI seems complicated:

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com
   - Select project: krshfwuqifaxecbtrxmy

2. **Open SQL Editor:**
   - Left sidebar → SQL Editor
   - Click "+ New Query"

3. **Copy & Paste SQL:**
   - Open: `server/supabase-migration.sql`
   - Select ALL (Ctrl+A)
   - Copy
   - Paste into Supabase editor

4. **Execute:**
   - Click blue "RUN" button
   - Wait 30-60 seconds
   - Should show: "Query executed successfully"

5. **Test Signup:**
   - Refresh http://localhost:3000  
   - Create new account
   - Profile will now save permanently ✅

---

## Troubleshooting

### "Still getting table not found error"
→ The migration hasn't been applied yet. Use Option B or C above.

### "Signup still shows error"
→ Try clicking the "Or explore in Instant Commander Demo Mode" button
→ This uses pre-seeded demo accounts that work immediately

### "Data disappeared after server restart"
→ Migration hasn't been applied yet. Your data is stored locally only.
→ Apply migration (Option B or C) to make data persistent.

---

## What Happens After Migration

Once you apply the migration (Option B or C):

1. ✅ All signup data persists permanently
2. ✅ New users can login with their created accounts  
3. ✅ All wellness features become fully functional
4. ✅ Wearable telemetry data syncs correctly
5. ✅ Admin/commander dashboards work properly

---

## Need Help?

Run this command to see setup instructions:
```bash
node "c:\Users\hp\OneDrive\Desktop\VeerWell 2.0\server\migration-helper.mjs"
```

Or check the server logs for detailed error messages:
```bash
# Terminal showing backend (npm run dev in server folder)
# Watch for [VeerWell Server] messages
```

---

**Bottom Line:** Your app works NOW for testing. Apply the migration when you're ready for production! 🚀
