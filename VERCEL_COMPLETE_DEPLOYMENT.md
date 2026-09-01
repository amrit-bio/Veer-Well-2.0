# 🚀 VeerWell Complete Vercel Deployment Guide

## Executive Summary

VeerWell 2.0 is a **monorepo** with:
- **Frontend (client/)**: React + Vite → Deploy to **Vercel**
- **Backend (server/)**: Express.js + TypeScript → Deploy to **Railway/Render/Replit**

This guide covers **complete setup** for hosting both frontend and backend without errors.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your VeerWell App                        │
├─────────────────────────┬─────────────────────────────────┤
│   Frontend (Vercel)     │     Backend (Railway/Render)    │
├─────────────────────────┼─────────────────────────────────┤
│ • React App             │ • Express.js API                │
│ • Vite Build            │ • TypeScript                    │
│ • Static Pages          │ • Supabase Integration          │
│ • Vercel URL            │ • Port 5000 / Custom Domain    │
│ your-app.vercel.app     │ your-api.railway.app            │
└─────────────────────────┴─────────────────────────────────┘
         ↓ HTTPS Calls ↓
         API_BASE URL configured in frontend
```

---

## ✅ Part 1: Local Development Setup

### Step 1: Install Dependencies

```bash
# Root level
npm install

# Frontend
cd client
npm install
cd ..

# Backend
cd server
npm install
cd ..
```

### Step 2: Create Environment Files

**Frontend** (`client/.env.local`):
```
VITE_SUPABASE_URL=https://krshfwuqifaxecbtrxmy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyDkmQ...
VITE_API_BASE=http://localhost:5000
```

**Backend** (`server/.env.local`):
```
SUPABASE_URL=https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyDkmQ...
JWT_SECRET=veerwell_super_secret_jwt_key_2026
PORT=5000
NODE_ENV=development
```

### Step 3: Run Locally

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
# Listens on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
# Listens on http://localhost:5173
```

### Step 4: Test API Connection

```bash
# Test backend is running
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com"}'

# Frontend should show no CORS errors
# Browser console should show: [API] Base URL: http://localhost:5000
```

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Connect Repository to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your GitHub repository (VeerWell-2.0)
4. Click **"Import"**

### Step 2: Configure Build Settings

Vercel should auto-detect, but verify:
- **Framework Preset**: Vite
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install --prefix client`

### Step 3: Add Environment Variables

In **Vercel Dashboard → Your Project → Settings → Environment Variables**:

Add these variables for **Production, Preview, and Development**:

```
Name: VITE_SUPABASE_URL
Value: https://krshfwuqifaxecbtrxmy.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✓ Production ✓ Preview ✓ Development

Name: VITE_GEMINI_API_KEY
Value: AIzaSyDkmQ...
Environments: ✓ Production ✓ Preview ✓ Development

Name: VITE_API_BASE
Value: https://your-backend-url.railway.app  ← IMPORTANT!
Environments: ✓ Production ✓ Preview ✓ Development
```

⚠️ **CRITICAL**: The `VITE_API_BASE` must point to your deployed backend URL. Don't set this until backend is deployed.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Get your Vercel URL: `your-app.vercel.app`

### Step 5: Verify Frontend Works

```bash
# Open your Vercel URL in browser
https://your-app.vercel.app

# Check browser console for:
# [API] Base URL: http://localhost:5000  ← This will be wrong until VITE_API_BASE is set
```

---

## 🖥️ Part 3: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Sign up with GitHub
3. Grant Railway access to your repos

### Step 2: Create New Project

1. Click **"Create"** → **"New Project"** → **"Deploy from GitHub repo"**
2. Select `VeerWell-2.0` repository
3. Click **"Import"**

### Step 3: Configure Build & Start

Railway should auto-detect, but verify settings:
- **Build Command**: `cd server && npm run build`
- **Start Command**: `cd server && npm start`

In Railway Dashboard → Settings:
```
Root Directory: (leave blank - auto-detect)
Build Command: cd server && npm run build
Start Command: cd server && npm start
```

### Step 4: Add Environment Variables

In **Railway Dashboard → Variables** → Add:

```
SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY = AIzaSyDkmQ...
JWT_SECRET = veerwell_super_secret_jwt_key_2026
PORT = 5000
NODE_ENV = production
ALLOWED_ORIGINS = https://your-app.vercel.app
```

### Step 5: Get Backend URL

In Railway Dashboard → Project → Deployments:
- Look for **"Public URL"** or **"Domain"**
- Example: `https://your-app-production.railway.app`

---

## 🔗 Part 4: Connect Frontend to Backend

### After Backend is Deployed

1. Go back to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Update `VITE_API_BASE`:
   ```
   VITE_API_BASE = https://your-app-production.railway.app
   ```
3. Click **"Save"**
4. Vercel will **auto-redeploy** with new variables

### Verify Connection

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Open **Browser Console** (F12)
3. Should see:
   ```
   [API] Base URL: https://your-app-production.railway.app
   [API] Gemini Key configured: true
   ```
4. Try logging in or using AI features
5. Network tab should show API calls to Railway URL (not 404)

---

## 🔧 Part 5: Troubleshooting

### Frontend shows "Cannot reach API" or 404

**Problem**: `VITE_API_BASE` not set or pointing to wrong URL

**Solution**:
```bash
# Check Vercel Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Ensure VITE_API_BASE is set to backend URL
3. Redeploy: Deployments → Right-click latest → Redeploy
4. Wait 2-3 minutes for new build
```

### Backend API responds with CORS error

**Problem**: Frontend URL not allowed in backend CORS

**Solution**:
```bash
# In Railway Dashboard → Variables:
1. Update ALLOWED_ORIGINS:
   ALLOWED_ORIGINS = https://your-app.vercel.app
2. Redeploy backend
3. Clear browser cache
```

### Supabase Auth fails

**Problem**: Wrong credentials or keys exposed

**Solution**:
```bash
# Regenerate Supabase keys:
1. Go to https://app.supabase.com
2. Select project → Settings → API
3. Regenerate "anon (public)" and "service_role (secret)" keys
4. Update variables in Vercel and Railway
5. Redeploy both
```

### Environment variables not appearing in build

**Problem**: Variables added after Vercel project creation

**Solution**:
```bash
# Vercel requires a redeploy to pick up new variables:
1. Vercel Dashboard → Deployments
2. Right-click latest deployment → "Redeploy"
3. Wait for build to complete
```

### Build fails with "tsc: command not found"

**Problem**: TypeScript compiler not in PATH

**Solution**:
```bash
# Already fixed in package.json, but verify:
# server/package.json should have:
"build": "npx tsc"

# NOT: "build": "tsc"
```

---

## 📊 Part 6: Monitoring & Maintenance

### Check Frontend Status
```bash
# Vercel Dashboard → your-app → Deployments
# Check build logs, runtime logs, and performance
```

### Check Backend Status
```bash
# Railway Dashboard → Project → Deployments
# Check build logs and runtime logs
```

### Monitor API Calls
```bash
# Browser DevTools → Network tab → Filter by XHR
# Should see calls to: https://your-api.railway.app/api/*
```

### Check Error Logs

**Frontend**:
```bash
# Vercel Dashboard → Deployments → View logs
# Check for Vite build errors
```

**Backend**:
```bash
# Railway Dashboard → Project → View logs
# Check for Express/API errors
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on API calls | Backend URL not set | Update `VITE_API_BASE` in Vercel, redeploy |
| CORS errors | Frontend not in allowed origins | Add Vercel URL to `ALLOWED_ORIGINS` in Railway |
| "Cannot find module" | Dependencies not installed | Verify `npm install` in build command |
| Supabase auth fails | Wrong keys | Regenerate keys in Supabase dashboard |
| Build takes >5 min | Large node_modules | Clear cache: Vercel → Settings → Git → Clear Build Cache |

---

## 📝 Quick Reference URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel Dashboard | https://vercel.com/dashboard | Manage frontend deployment |
| Railway Dashboard | https://railway.app | Manage backend deployment |
| Supabase | https://app.supabase.com | Database & Auth |
| Google AI Studio | https://aistudio.google.com/app/apikey | Get Gemini API key |

---

## ✨ Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway
3. ✅ Set `VITE_API_BASE` in Vercel
4. ✅ Test login flow
5. ✅ Test AI features
6. ✅ Monitor logs for errors
7. ✅ Set up custom domain (optional)

---

## 📞 Support

If you encounter issues:

1. **Check browser console** (F12) for errors
2. **Check Vercel build logs** → Deployments → View logs
3. **Check Railway logs** → Project → View logs
4. **Verify environment variables** match expected values
5. **Check GitHub Actions** for deployment status

---

**Last Updated**: September 2024
**Version**: VeerWell 2.0
