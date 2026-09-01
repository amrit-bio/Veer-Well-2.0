# 🚨 VeerWell Vercel Deployment Troubleshooting Guide

## Problem: 404 Errors & AI Not Working on Vercel

### Root Cause
When deployed on Vercel, the frontend tries to call `/api` endpoints, but:
1. Vercel only serves **static frontend files** - no backend
2. API calls fail with 404 because there's no backend API endpoint
3. AI calls fail because `GEMINI_API_KEY` may not be set
4. Supabase auth works, but profile creation/fetching fails

---

## ✅ Solution: Deploy Backend Separately

VeerWell has a **monorepo architecture**:
- **Frontend** → Vercel
- **Backend** → Railway, Render, or Replit

### Step-by-Step Fix

#### **1️⃣ Deploy Backend to Railway (Recommended)**

Railway is free for first $5/month, perfect for hobby projects.

**Step A: Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub
- Create new project

**Step B: Connect Your Repository**
1. Click "Create" → "New Project"
2. Select "Deploy from GitHub repo"
3. Select `amrit-bio/Veer-Well-2.0`
4. Confirm

**Step C: Configure Build & Start Commands**
In Railway dashboard:
```
Build Command: cd server && npm run build
Start Command: cd server && npm start
```

**Step D: Add Environment Variables**
Railway → Project → Variables → Add:
```
SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY = [Your service_role secret key]
SUPABASE_PUBLISHABLE_KEY = [Your anon public key]
GEMINI_API_KEY = [Your Google Gemini API key]
JWT_SECRET = veerwell_super_secret_jwt_key_2026
NODE_ENV = production
PORT = 3000
```

**Step E: Deploy**
- Click "Deploy" button
- Wait 2-5 minutes
- Copy the generated URL (e.g., `https://veerwell-server-prod.railway.app`)

#### **2️⃣ Update Vercel Frontend with Backend URL**

**In Vercel Dashboard:**

1. Go to **Project → Settings → Environment Variables**
2. Add this new variable:
   ```
   VITE_API_BASE = https://veerwell-server-prod.railway.app
   ```
   (Replace with your actual Railway URL)

3. Existing variables:
   ```
   VITE_SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
   VITE_SUPABASE_ANON_KEY = [Your anon key]
   VITE_GEMINI_API_KEY = [Your Gemini API key]
   ```

4. **Redeploy** → Click "Redeploy" on latest deployment

---

## 🔍 Verify It's Working

### ✅ Check Backend Health
```bash
curl https://your-railway-url/api/health
# Should return: {"status": "ok"}
```

### ✅ Check Frontend Console
1. Open your Vercel app URL
2. Open Browser DevTools (F12)
3. Check Console tab - should show:
   ```
   [API] Base URL: https://your-railway-url
   [API] Gemini Key configured: true
   ```

### ✅ Test Login
1. Sign up with test account
2. Check Network tab (F12 → Network)
3. Look for `/api/auth/signup` calls
4. Should see 200 response with `userId`
5. Check if profile was created in Supabase

### ✅ Test AI Chat
1. After login, go to Rakshak AI section
2. Send a message
3. Check Network tab for `/api/chat` call
4. Should return AI response

---

## 🛠️ Common Issues & Fixes

### Issue 1: Still Getting 404 Errors

**Symptoms:**
```
POST /api/auth/signup → 404
POST /api/chat → 404
```

**Fix:**
1. Verify `VITE_API_BASE` is set in Vercel
2. Value must be full URL: `https://your-railway-url` (NOT just `/api`)
3. Redeploy Vercel after updating

### Issue 2: AI Not Responding

**Symptoms:**
```
"Empty AI response" or timeout
```

**Fix:**
1. Check `GEMINI_API_KEY` is set in Vercel
2. Verify API key is valid: https://aistudio.google.com/app/apikey
3. Check Railway logs for API errors

### Issue 3: Signup Works But Profile Not Saved

**Symptoms:**
```
Login succeeds but profile data is empty
```

**Fix:**
1. Check Supabase connection in Railway:
   - Go to Railway → Variables
   - Verify `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
2. Check Supabase database:
   - Go to https://app.supabase.com
   - Select project: krshfwuqifaxecbtrxmy
   - Check `public.profiles` table for your user

### Issue 4: CORS Errors in Browser Console

**Symptoms:**
```
Cross-Origin Request Blocked
```

**Fix:**
- ✅ Already fixed in this update!
- Server now allows Vercel origins
- Restart both frontend and backend

---

## 🚀 What Changed in This Update

### Frontend (`client/src/services/api.ts`)
```javascript
// OLD: Hardcoded to /api
const API_BASE = '/api';

// NEW: Configurable via environment variable
const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';
```

**Benefits:**
- ✅ Works in development (`/api` via proxy)
- ✅ Works in production (full backend URL)
- ✅ Adds console logging for debugging

### Backend (`server/src/server.ts`)
```javascript
// OLD: Allowed all origins
app.use(cors({ origin: '*' }));

// NEW: Explicitly configured CORS
app.use(cors({
  origin: (origin, callback) => { /* ... */ },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

**Benefits:**
- ✅ Allows Vercel deployments
- ✅ Allows localhost for dev
- ✅ Better security and debugging

### Environment Files
- ✅ Added `VITE_API_BASE` to all `.env.example` files
- ✅ Updated Vercel setup guide with backend deployment info
- ✅ Clear instructions for production URLs

---

## 📋 Quick Reference: Environment Variables Needed

### For Vercel Frontend
| Variable | Value | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Supabase URL | `https://krshfwuqifaxecbtrxmy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOi...` |
| `VITE_GEMINI_API_KEY` | Google API key | `AQ.Ab8RN6Ic...` |
| `VITE_API_BASE` | Backend URL | `https://veerwell-server.railway.app` |

### For Railway Backend
| Variable | Value | Example |
|----------|-------|---------|
| `SUPABASE_URL` | Supabase URL | `https://krshfwuqifaxecbtrxmy.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret | `sb_secret_...` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `sb_publishable_...` |
| `GEMINI_API_KEY` | Google API key | `AQ.Ab8RN6Ic...` |
| `JWT_SECRET` | Any secure string | `veerwell_super_secret_jwt_key_2026` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |

---

## ✅ Complete Deployment Checklist

- [ ] Backend deployed to Railway (or Render/Replit)
- [ ] Backend URL copied (e.g., `https://veerwell-server.railway.app`)
- [ ] `VITE_API_BASE` added to Vercel environment variables
- [ ] All other environment variables configured in both Vercel and Railway
- [ ] Vercel frontend redeployed (after env var changes)
- [ ] Backend API health check works (`/api/health` returns `{"status": "ok"}`)
- [ ] Signup flow tested - user created in Supabase
- [ ] Login flow tested - auth token received
- [ ] Profile creation tested - data saved to `public.profiles`
- [ ] AI chat tested - response received from Gemini
- [ ] Console shows `[API] Base URL: https://your-backend-url`

---

## 🆘 Still Not Working?

### Debug Steps

1. **Check Vercel Build Logs**
   - Vercel Dashboard → Deployments → Click latest → View Build Logs
   - Look for build errors or missing env vars

2. **Check Backend Logs**
   - Railway Dashboard → Your Project → Logs
   - Look for `[VeerWell Server] ✅ Supabase Admin initialized`
   - Look for any error messages

3. **Check Browser Network Tab**
   - F12 → Network
   - Look at failed requests
   - Check response status and body
   - Example: `POST /api/auth/signup` should return 200 with `{ userId: "..." }`

4. **Check Supabase Dashboard**
   - Auth → Users tab (verify users created)
   - SQL Editor → `SELECT * FROM profiles` (verify profile data)
   - Logs → Check for errors

5. **Test API Directly**
   ```bash
   # Test backend health
   curl https://your-railway-url/api/health

   # Test signup
   curl -X POST https://your-railway-url/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User","rank":"Jawan","serviceNumber":"123","force":"CRPF","unit":"Unit A","role":"personnel"}'
   ```

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Google Gemini API:** https://ai.google.dev/docs

---

**Updated:** 2026-09-01  
**Status:** ✅ All fixes applied and tested locally
