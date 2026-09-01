# 🚀 VeerWell Deployment Guide

## Problem: `tsc: command not found` in Vercel

**Issue:** When deploying to Vercel, the build fails with:
```
sh: line 1: tsc: command not found
Error: Command "npm run build" exited with 127
```

**Root Cause:** The build scripts were calling `tsc` directly instead of using `npx tsc`. Vercel's build environment can't find the TypeScript compiler in the PATH.

**Solution:** Updated build scripts to use `npx tsc`:
- ✅ `client/package.json` - Changed to `"build": "npx tsc && vite build"`
- ✅ `server/package.json` - Changed to `"build": "npx tsc"`
- ✅ Added `vercel.json` for Vercel-specific configuration

---

## 📦 Deployment Architecture

VeerWell is a **monorepo with separate frontend and backend**:

```
VeerWell 2.0/
├── client/          ← React + Vite (Frontend)
├── server/          ← Express.js (Backend API)
└── package.json     ← Root (coordinates both)
```

### Vercel's Limitation
Vercel is **primarily for frontend hosting**. It can serve static sites and serverless functions, but not traditional Node.js backends.

### Recommended Deployment Strategy

#### **Option A: Frontend on Vercel + Backend on Railway (RECOMMENDED)**
```
┌─────────────────┐
│  Vercel         │
│  (React App)    │───────────► api.yourdomain.com
└─────────────────┘
        ↓
  Hosted at your-app.vercel.app
  
┌─────────────────────┐
│  Railway            │
│  (Express Server)   │  ← API calls from frontend
└─────────────────────┘
  Hosted at api.yourdomain.com or railway URL
```

#### **Option B: Backend on Render/Replit**
- Render: https://render.com (similar to Railway)
- Replit: https://replit.com (free tier available)

---

## 🔧 Fix Applied

### Changes Made:
1. **client/package.json**
   ```json
   "build": "npx tsc && vite build"
   ```

2. **server/package.json**
   ```json
   "build": "npx tsc"
   ```

3. **vercel.json** (new file)
   ```json
   {
     "buildCommand": "cd client && npm install && npm run build",
     "outputDirectory": "client/dist",
     "framework": "vite"
   }
   ```

---

## 📋 Vercel Frontend Deployment

### Step 1: Connect Your GitHub Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `Veer-Well-2.0` repository
4. Click "Import"

### Step 2: Configure Build Settings
- **Framework Preset:** Vite
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/dist`
- **Install Command:** `npm install --prefix client`

### Step 3: Add Environment Variables
In Vercel Project Settings → Environment Variables, add:

```
VITE_SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
VITE_SUPABASE_ANON_KEY = [Your anon JWT key]
VITE_GEMINI_API_KEY = [Your Google Gemini API key]
```

### Step 4: Deploy
Click **Deploy** → Wait for build to complete

---

## 🖥️ Backend Deployment (Express Server)

Since Vercel isn't ideal for backends, use one of these options:

### Option A: Railway (Recommended)

1. **Sign up:** https://railway.app
2. **Create new project**
3. **Connect GitHub** repository
4. **Configure:**
   - **Build Command:** `cd server && npm run build`
   - **Start Command:** `npm start` (from server directory)
   - **Environment Variables:**
     ```
     SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
     SUPABASE_SECRET_KEY = [Your secret key]
     SUPABASE_PUBLISHABLE_KEY = [Your anon key]
     GEMINI_API_KEY = [Your API key]
     JWT_SECRET = veerwell_super_secret_jwt_key_2026
     NODE_ENV = production
     ```
5. **Deploy**

### Option B: Render

1. **Sign up:** https://render.com
2. **New → Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - **Build Command:** `cd server && npm run build`
   - **Start Command:** `node dist/src/server.js`
   - **Environment Variables:** (same as Railway)

### Option C: Replit

1. **Import from GitHub:** https://replit.com/new
2. **Select your repository**
3. **Replit will auto-detect Node.js**
4. **Add environment variables** in Secrets
5. **Run** → Replit provides a live URL

---

## 🔗 Connect Frontend to Backend

After deploying both, update the frontend API calls:

**File:** `client/src/services/api.ts`

```typescript
// Replace this:
const API_BASE = '/api';

// With this:
const API_BASE = process.env.VITE_API_BASE || 'https://your-backend-url.railway.app/api';
```

Then add to Vercel environment variables:
```
VITE_API_BASE = https://your-backend-url.railway.app/api
```

---

## ✅ Deployment Checklist

- [ ] Fixed `tsc` build error (already done ✓)
- [ ] Added `vercel.json` configuration (already done ✓)
- [ ] Connected GitHub to Vercel
- [ ] Set frontend environment variables in Vercel
- [ ] Deployed frontend to Vercel
- [ ] Deployed backend to Railway/Render/Replit
- [ ] Updated frontend API_BASE URL
- [ ] Tested signup/login flow
- [ ] Monitored browser console for errors
- [ ] Checked API response in Network tab

---

## 🚨 Troubleshooting

### Build Still Fails in Vercel
1. Check build logs in Vercel dashboard
2. Verify all dependencies are installed: `npm install` in client and server
3. Clear Vercel cache and redeploy
4. Ensure `vercel.json` is in root directory

### `undefined is not a function` errors
- Usually means `API_BASE` is pointing to wrong backend
- Check network tab in browser to see actual API calls
- Verify backend is running and accessible

### CORS errors
- Add CORS configuration to server
- In `server/src/server.ts`:
  ```typescript
  app.use(cors({
    origin: 'https://your-vercel-app.vercel.app',
    credentials: true
  }));
  ```

### Database connection failures
- Verify Supabase credentials in environment variables
- Check Supabase database is online
- Test with: `curl https://krshfwuqifaxecbtrxmy.supabase.co`

---

## 🔒 Security Notes

- ✅ All secret keys are in environment variables (not in code)
- ✅ Never commit `.env` files
- ✅ GitHub Push Protection blocks accidentally exposed secrets
- ✅ Regenerate keys if exposed
- ✅ Use HTTPS only in production

---

## 📞 Support

For deployment issues:
- **Vercel:** https://vercel.com/docs
- **Railway:** https://railway.app/docs
- **Render:** https://render.com/docs
- **Supabase:** https://supabase.com/docs

---

**Next Step:** Go to Vercel dashboard and trigger a redeploy with the latest code. The `tsc` error should now be fixed! 🎉
