# 🚨 VERCEL ENVIRONMENT VARIABLES SETUP GUIDE

## URGENT SECURITY NOTICE ⚠️
Your Supabase and Google API keys have been exposed in this conversation. 

**IMMEDIATE ACTIONS REQUIRED:**
1. Go to Supabase dashboard → Settings → API
2. Regenerate both the "anon (public)" and "service_role (secret)" keys
3. Go to Google AI Studio → Delete and recreate your API key
4. Update Vercel environment variables with the NEW keys

---

## How to Add These to Vercel

1. Log in to **https://vercel.com/dashboard**
2. Select your **Veer-Well-2.0** project
3. Go to **Settings → Environment Variables**
4. Copy and paste the following variables one by one (with YOUR actual values):

### Frontend Variables (used in `client/` build)
```
VITE_SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
VITE_SUPABASE_ANON_KEY = [Your anon JWT token from Supabase]
VITE_GEMINI_API_KEY = [Your Google Gemini API key]
VITE_API_BASE = [Your backend URL - e.g., https://your-api.railway.app]
```

### Backend Variables (used in `server/` runtime)
```
SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY = [Your Supabase service_role secret key]
SUPABASE_PUBLISHABLE_KEY = [Your Supabase anon public key]
GEMINI_API_KEY = [Your Google Gemini API key]
JWT_SECRET = veerwell_super_secret_jwt_key_2026
PORT = 5000
NODE_ENV = production
```

---

## Vercel Configuration Steps

1. **Select Environment**: Choose which environments these apply to
   - ✅ Production
   - ✅ Preview
   - ✅ Development (if desired)

2. **Save Each Variable** as you add them

3. **Redeploy** your project after adding all variables
   - Vercel → Deployments → Right-click latest → Redeploy

---

## Environment Variables By Purpose

| Variable | Purpose | Type | Used In |
|----------|---------|------|---------|
| `VITE_SUPABASE_URL` | Frontend Supabase connection | Public | client/ |
| `VITE_SUPABASE_ANON_KEY` | Frontend auth (anonymous) | Public | client/ |
| `VITE_GEMINI_API_KEY` | Frontend AI calls | Public | client/ |
| `SUPABASE_URL` | Backend Supabase connection | Public | server/ |
| `SUPABASE_SECRET_KEY` | Backend admin access (SECRET) | Secret | server/ |
| `SUPABASE_PUBLISHABLE_KEY` | Backend public key | Public | server/ |
| `GEMINI_API_KEY` | Backend AI calls | Secret | server/ |
| `JWT_SECRET` | Token signing | Secret | server/ |
| `PORT` | Server port | Public | server/ |
| `NODE_ENV` | Environment mode | Public | server/ |

---

## ⚠️ SECURITY BEST PRACTICES

1. **Never commit `.env` to git** - Already configured in `.gitignore`
2. **Rotate keys regularly** - Especially after exposure
3. **Use different keys for prod/dev** - Consider separate Supabase projects
4. **Monitor API usage** - Check Google Console and Supabase dashboard for unusual activity
5. **Restrict API key permissions** - In Google Console, limit to specific APIs
6. **Enable Supabase RLS** - Row-level security on database tables

---

## Files Created for Local Development

- `/.env.production` - All production variables (for local testing)
- `/.env.example` - Template without secrets
- `/client/.env.example` - Frontend template
- `/server/.env.example` - Backend template

---

## Testing After Deployment

After variables are set in Vercel and deployment completes:

1. Visit your Vercel app URL
2. Test signup flow: Create new account
3. Test login: Use created credentials
4. Test AI features: Ask Rakshak AI something
5. Check browser console: No 401/403 auth errors

If issues occur:
- Check Vercel build logs
- Verify all variables are set correctly
- Check for typos in long JWT/API keys
- Test locally first with `.env.production`

---

## Need to Update Keys Later?

1. Regenerate in Supabase/Google
2. Update in Vercel Settings → Environment Variables
3. Redeploy the project
4. Verify functionality
