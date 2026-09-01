# VeerWell 2.0 - Restart Guide for Recent Updates

## 📌 Action Required

Your servers need to be **restarted** to load all changes:

✅ Email OTP verification enabled
✅ Real-life force deployments added
✅ Rakshak AI branding implemented

---

## 🔄 Quick Restart Steps

### Option 1: Restart Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd "c:\Users\hp\OneDrive\Desktop\VeerWell 2.0\server"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\hp\OneDrive\Desktop\VeerWell 2.0\client"
npm run dev
```

### Option 2: Soft Reload (if servers still running)
Press **F5** on http://localhost:3000 to reload frontend
Backend will auto-reload TypeScript files

---

## ✨ What to Test After Restart

### 1. Email OTP Verification ✅
```
1. Go to http://localhost:3000
2. Click "Create Secure Account"
3. Fill in signup form
4. Click "Create Secure Account"
5. Should see: "Check your email for OTP"
6. (Check inbox for OTP code)
7. Enter 6-digit OTP
8. Click "Verify Email OTP"
9. Account created! ✅
```

### 2. Real Force Deployments ✅
```
1. Login as commander (pre-seeded account):
   - Email: commander.singh@crpf.gov.in
   - Password: test123
2. Navigate to "Predictive Analytics" tab
3. Should see:
   ✅ BSF Rajasthan Ops
   ✅ CRPF 142 Bn Kashmir
   ✅ ITBP Ladakh Sector
   ✅ CISF Airport Security
```

### 3. What-If Simulator Labels ✅
```
1. In Predictive Analytics → "What-if simulator" tab
2. Check slider labels:
   ✅ "Weekly Border Patrol Hours"
   ✅ "Mandatory Rest & Recovery Days"
   ✅ Range: "32h (Standard)" to "68h (Extended Ops)"
```

### 4. Rakshak AI Branding ✅
```
1. Open Rakshak AI chat (bottom right icon)
2. Should see greeting:
   "I am Rakshak AI, powered by advanced AI..."
3. Check console logs (F12 → Console):
   - No "Gemini" errors
   - Should see "Rakshak AI Engine" references
```

---

## 📊 Frontend Changes Impact

| Feature | Before | After |
|---------|--------|-------|
| Signup | Auto-confirmed | Requires OTP email verification |
| Forces | Generic names | Real CAPF deployments (BSF, CRPF, ITBP, CISF) |
| Simulator | Vague labels | Authentic military terminology |
| AI Branding | "Gemini API" | "Rakshak AI Engine" |

---

## 🔧 Troubleshooting

### "OTP not arriving"
- Supabase sends automatically - check spam folder
- Verify SUPABASE_SECRET_KEY in server/.env is correct
- Check server logs for errors

### "Still seeing old data"
- Hard refresh: Ctrl+Shift+Delete (clear cache)
- Close all tabs and restart browser
- Kill servers and restart npm processes

### "Forces still showing old names"
- Refresh page (F5)
- Check that you logged in after restart
- Clear browser cache if persists

### "Rakshak AI not showing"
- Browser cache issue - do hard refresh
- Check F12 console for errors
- Restart both servers

---

## 📍 Changed Files Reference

```
✅ server/src/server.ts
   - Lines 174, 205: email_confirm changed
   - Lines 1043-1189: Renamed Gemini→Rakshak functions

✅ client/src/components/auth/SupabaseAuth.tsx
   - Lines 35-55: Added OTP mode and state
   - Lines 92-118: Added handleVerifyOtp function
   - Lines 391-410: Added OTP input field
   - Lines 520-522: Updated submit button logic

✅ client/src/components/tabs/PredictiveAnalyticsTab.tsx
   - Lines 42-69: Updated cohortForecasts with real forces
   - Lines 70-82: Updated correlationData with real units
   - Lines 84-102: Updated sampleRecords with real officers
   - Lines 280-306: Updated simulator labels

✅ client/src/services/api.ts
   - Lines 22-160: Renamed callDirectGemini→callRakshakAI
   - Updated all references and comments
```

---

## ⏱️ Expected Restart Time

- Backend restart: **15-30 seconds**
- Frontend restart: **10-20 seconds**
- Total ready time: **~1 minute**

---

## ✅ Success Indicators

After restart, you should see:

1. **Server Output**
   ```
   [VeerWell Server] ✅ Supabase Admin initialized
   [VeerWell Server] Server running at http://localhost:5000
   ```

2. **Frontend Output**
   ```
   ✓ Local: http://localhost:3000/
   ✓ Network: (your local network IP)
   ```

3. **Page Load**
   - http://localhost:3000 loads with login screen
   - No errors in browser console (F12)
   - Rakshak AI icon appears in bottom right

---

## 🎉 Ready to Go!

Once servers restart and tests pass, you're all set to:
- ✅ Sign up with email OTP verification
- ✅ Explore real CAPF deployment forecasts
- ✅ Use authentic military terminology
- ✅ Chat with Rakshak AI (no Gemini branding)

---

## 📞 Need Help?

Check these files for detailed info:
- `RECENT_UPDATES.md` - Full changelog
- `SETUP_COMPLETE.md` - General setup guide
- `DATABASE_SETUP_GUIDE.md` - Database info

---

**Status**: Ready for Server Restart ✅
**Restart Command**: `npm run dev` (in both folders)
**Time to Deploy**: ~1 minute
