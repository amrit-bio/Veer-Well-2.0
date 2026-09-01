# 🚨 Vercel 404 Error - Complete Diagnosis & Fix

## Problem
After deploying to Vercel, clicking "Create Secure Account" returns:
```
Server error (404: )
```

## Root Cause Analysis

### ❌ Why This Happens:

The frontend on Vercel (e.g., `https://your-app.vercel.app`) is trying to call the backend API, but:

1. **VITE_API_BASE not set in Vercel** → Falls back to `/api`
2. **Backend not deployed** → No actual API endpoint exists
3. **Wrong backend URL** → Points to localhost:5000 instead of real server
4. **CORS blocking** → Backend doesn't allow Vercel domain

---

## ✅ Solution: 3-Step Fix

### Step 1: Check if Backend is Deployed

You need a backend server running. Options:
- **Railway** (Recommended) - Free tier: $5/month credit
- **Render** - Free tier available
- **Replit** - Free forever

**If you DON'T have a backend deployed yet:**
1. Go to https://railway.app
2. Create account (sign in with GitHub)
3. Click "Create" → "Deploy from GitHub repo"
4. Select your VeerWell-2.0 repo
5. Set variables (see step 3 below)
6. Deploy and get the URL

### Step 2: Get Your Backend URL

After backend is deployed, get the public URL:
- **Railway**: Dashboard → Project → Settings → Networking → Copy "Public URL"
- **Render**: Dashboard → Service → Copy "Service URL"
- **Replit**: Copy the "deployed URL"

Example: `https://veerwell-server-production.railway.app`

### Step 3: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add `VITE_API_BASE` variable:

```
Name:  VITE_API_BASE
Value: https://your-backend-url.railway.app
Environments: ✓ Production ✓ Preview ✓ Development
```

Make sure you also have:
```
VITE_SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
VITE_SUPABASE_ANON_KEY = [Your key from Supabase dashboard]
VITE_GEMINI_API_KEY = [Your key from Google AI Studio]
```

### Step 4: Redeploy on Vercel

1. Go to **Vercel Dashboard** → **Deployments**
2. Find the latest deployment
3. Click the **three dots** → **Redeploy**
4. Wait for build to complete

### Step 5: Test

1. Open your Vercel app: `https://your-app.vercel.app`
2. Open Browser Console (F12)
3. Should see:
   ```
   [API] Base URL: https://your-backend-url.railway.app
   [VeerWell Client] 📡 Calling signup endpoint: https://your-backend-url.railway.app/auth/signup
   ```
4. Try creating account - should work now!

---

## 🔍 Debugging Checklist

Run through this to find the exact problem:

### ✓ Check 1: Is Backend Deployed?
```bash
# Test if backend URL works
curl https://your-backend-url.railway.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"personnel"}'

# Should return JSON with token, NOT 404
```

### ✓ Check 2: Is VITE_API_BASE Set in Vercel?
1. Go to **Vercel Dashboard** → Settings → Environment Variables
2. Look for `VITE_API_BASE`
3. If missing → Add it!
4. If wrong value → Update it!

### ✓ Check 3: Did You Redeploy After Adding Env Vars?
1. Vercel Dashboard → Deployments
2. Right-click latest → Redeploy
3. Wait for new build (don't skip this step!)

### ✓ Check 4: Check Browser Console for Errors
1. Open app on Vercel
2. Press F12 → Console tab
3. Look for:
   ```
   [API] Base URL: ________  ← Should show your backend URL
   [VeerWell Client] 📡 Calling signup endpoint: ________ → Should be full URL
   ```

### ✓ Check 5: Check Network Tab
1. Press F12 → Network tab
2. Try to create account
3. Look for failed requests
4. Check what URL it's calling
5. Check response status (should show actual error, not just 404)

---

## 📋 Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| 404 Error | Is backend deployed? | Deploy to Railway/Render/Replit |
| Wrong URL showing | Check VITE_API_BASE in Vercel env vars | Set to correct backend URL |
| Env var not taking effect | Did you redeploy? | Redeploy from Vercel dashboard |
| Still 404 after redeploy | Check browser console | Verify API endpoint is working |
| CORS error | Check backend ALLOWED_ORIGINS | Should include Vercel domain |

---

## 🚀 Quick Setup if You Have No Backend

### Deploy Backend in 5 Minutes:

**Option A: Railway (Recommended)**
```
1. Go to https://railway.app
2. Click "Create" → "Deploy from GitHub repo"
3. Select VeerWell-2.0
4. Add variables (SUPABASE_*, GEMINI_API_KEY, JWT_SECRET, etc.)
5. Deploy
6. Copy public URL
```

**Option B: Use Demo Mode (No Real Backend)**
Set `VITE_API_BASE` to empty or `/api` and use Supabase + Gemini API only.

---

## 📞 Still Having Issues?

### Step-by-step Troubleshooting:

1. **Check browser console** (F12):
   ```
   [API] Base URL: ________
   [VeerWell Client] 📡 Calling signup endpoint: ________
   [VeerWell Client] Server signup error - Status: 404
   ```

2. **Check what URL it's calling**:
   - If shows `http://localhost:5000` → VITE_API_BASE not set in production
   - If shows `undefined` → Environment variable issue
   - If shows wrong URL → VITE_API_BASE set incorrectly

3. **Test backend directly**:
   ```bash
   # If backend URL is: https://veerwell-api.railway.app
   curl https://veerwell-api.railway.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","role":"personnel"}'
   ```

4. **If backend returns error**:
   - Check backend logs in Railway/Render dashboard
   - Verify environment variables in backend
   - Ensure Supabase is configured

---

## ✨ Summary

To fix the 404 error:
1. ✅ Deploy backend (Railway recommended)
2. ✅ Get backend public URL
3. ✅ Set `VITE_API_BASE` in Vercel environment variables
4. ✅ Redeploy frontend
5. ✅ Test signup flow

---

**Next Action**: Which step are you on? Do you have a backend deployed?

Last Updated: September 2024
