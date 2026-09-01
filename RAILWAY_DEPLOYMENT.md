# 🚀 VeerWell Backend Deployment Guide (Railway)

## Quick Summary

Deploy your Express.js backend to Railway in 5 minutes:
1. Create Railway account
2. Import GitHub repo
3. Add environment variables
4. Deploy
5. Copy backend URL to Vercel

---

## ✅ Part 1: Prepare Backend for Production

### Verify Build Configuration

**server/package.json**:
```json
{
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/server.js"
  }
}
```

**server/tsconfig.json**:
```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### Test Build Locally

```bash
cd server
npm run build
npm start
```

---

## 🚆 Part 2: Deploy to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start Free"
3. Sign in with GitHub
4. Grant access to your repositories

### Step 2: Create New Project

1. Click "Create"
2. Select "Deploy from GitHub repo"
3. Find and select your VeerWell-2.0 repository
4. Click "Import"

### Step 3: Configure Build & Start

Railway should auto-detect, but verify in Settings:
```
Build Command: cd server && npm run build
Start Command: cd server && npm start
Port: 5000
```

### Step 4: Add Environment Variables

Go to Variables and add:

```
SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY = [From Supabase dashboard]
SUPABASE_PUBLISHABLE_KEY = [From Supabase dashboard]
GEMINI_API_KEY = [From Google AI Studio]
JWT_SECRET = veerwell_super_secret_jwt_key_2026
NODE_ENV = production
PORT = 5000
ALLOWED_ORIGINS = https://your-app.vercel.app
```

### Step 5: Deploy

Railway auto-deploys when you push to GitHub.

Monitor in Deployments section.

### Step 6: Get Backend URL

In Railway Settings → Networking, copy the Public URL.

Example: `https://veerwell-server-production.railway.app`

---

## 🔗 Part 3: Connect to Frontend

1. Copy Railway URL
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Set `VITE_API_BASE = https://your-railway-url`
4. Redeploy frontend

---

## 🔒 Security Checklist

- [ ] Never commit .env files
- [ ] Regenerate Supabase keys after exposure
- [ ] Use strong JWT_SECRET
- [ ] Set ALLOWED_ORIGINS to specific domains
- [ ] Monitor API usage

---

**Last Updated**: September 2024
**Version**: VeerWell 2.0
