# 🚨 VERCEL DEPLOYMENT GUIDE — Vercel Only (No Railway/Render)

## URGENT SECURITY NOTICE ⚠️
Your Supabase and Google API keys have been exposed in this conversation. 

**IMMEDIATE ACTIONS REQUIRED:**
1. Go to Supabase dashboard → Settings → API
2. Regenerate both the "anon (public)" and "service_role (secret)" keys
3. Go to Google AI Studio → Delete and recreate your API key
4. Update Vercel environment variables with the NEW keys

---

## Architecture

- **Frontend**: Vite React app (`client/`) → builds to `client/dist`
- **Backend**: Express server (`server/src/server.ts`) → compiles to `server/dist`
- **Serverless Layer**: `api/[[path]].ts` wraps the Express app as a Vercel serverless function
- **Existing Functions**: `api/translate/index.ts` and `api/chat/index.ts` remain as-is

---

## How to Deploy on Vercel

1. Log in to **https://vercel.com/dashboard**
2. Select your **Veer-Well-2.0** project (or import from GitHub)
3. Go to **Settings → Environment Variables**
4. Add the following variables:

### Frontend Variables (used during `client/` build)
```
VITE_SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
VITE_SUPABASE_ANON_KEY = [Your Supabase anon/public key]
VITE_GEMINI_API_KEY = [Your Google Gemini API key]
VITE_API_BASE = [Leave empty or set to your Vercel domain, e.g. https://your-app.vercel.app]
```

### Backend Variables (used at runtime in serverless functions)
```
SUPABASE_URL = https://krshfwuqifaxecbtrxmy.supabase.co
SUPABASE_SECRET_KEY = [Your Supabase service_role/secret key]
SUPABASE_PUBLISHABLE_KEY = [Your Supabase anon/public key]
GEMINI_API_KEY = [Your Google Gemini API key]
JWT_SECRET = [Strong random string, min 32 chars]
NODE_ENV = production
```

### Notes
- `PORT` is not needed on Vercel (serverless manages ports automatically)
- `VITE_API_BASE` can be left empty — the frontend will call `/api/*` on the same Vercel domain
- Choose environments: ✅ Production, ✅ Preview, ✅ Development

---

## Vercel Configuration

The updated `vercel.json` does the following:
1. Installs dependencies for both `client/` and `server/`
2. Compiles the Express backend with `tsc` into `server/dist`
3. Builds the React frontend with Vite into `client/dist`
4. Deploys `api/[[path]].ts` as a catch-all serverless function for `/api/*`

---

## Testing After Deployment

1. Visit your Vercel app URL
2. Test **signup**: enter any name, email, and password
3. In **Supabase SQL Editor**, verify the request:
   ```sql
   SELECT * FROM public.signup_requests WHERE review_status = 'awaiting_review' ORDER BY submitted_at DESC;
   ```
4. Create the MHA admin in **Supabase Dashboard → Authentication → Users**:
   - Email: `admin@mha.gov.in`
   - Password: choose one
   - Confirm email: yes
5. Create the matching profile in **Supabase SQL Editor**:
   ```sql
   INSERT INTO public.profiles (id, name, email, role, rank, force, unit, role_title, anonymized_id, avatar, location)
   VALUES (
     '<ADMIN_USER_UUID_FROM_AUTH_USERS>',
     'MHA System Administrator',
     'admin@mha.gov.in',
     'admin',
     'Administrator',
     'MHA',
     'MHA HQ',
     'MHA System Administrator',
     'CAPF-ADMIN-00',
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
     'MHA HQ, New Delhi'
   )
   ON CONFLICT (id) DO NOTHING;
   ```
6. Log in as `admin@mha.gov.in`
7. Go to **Review Dashboard** → approve the pending signup
8. The approved user should now be able to log in

---

## If Issues Occur

- **Build fails**: Check Vercel build logs for TypeScript compilation errors
- **"Failed to fetch"**: Check Vercel Functions logs for runtime errors in `api/[[path]]`
- **Auth errors**: Verify `SUPABASE_SECRET_KEY` and `VITE_SUPABASE_ANON_KEY` are correct
- **CORS errors**: On Vercel, the frontend and API share the same domain, so CORS should not be an issue

---

## Need to Update Keys Later?

1. Regenerate in Supabase/Google
2. Update in Vercel Settings → Environment Variables
3. Redeploy the project
4. Verify functionality
