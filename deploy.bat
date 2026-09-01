@echo off
REM VeerWell Complete Deployment Script (Windows)
REM This script helps set up and deploy VeerWell to Vercel and Railway

echo.
echo 🚀 VeerWell 2.0 Deployment Setup Script (Windows)
echo ================================================
echo.

REM Step 1: Install Dependencies
echo [Step 1] Installing dependencies...
call npm install
cd client
call npm install
cd ..
cd server
call npm install
cd ..
echo ✓ Dependencies installed
echo.

REM Step 2: Build Frontend
echo [Step 2] Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Frontend build failed
    exit /b 1
)
echo ✓ Frontend build successful
cd ..
echo.

REM Step 3: Build Backend
echo [Step 3] Building backend...
cd server
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Backend build failed
    exit /b 1
)
echo ✓ Backend build successful
cd ..
echo.

REM Step 4: Summary
echo ✓ Build completed successfully!
echo.
echo 📋 Next Steps:
echo.
echo 1. Frontend Deployment (Vercel):
echo    - Go to https://vercel.com/new
echo    - Import your GitHub repository
echo    - Add environment variables:
echo      * VITE_SUPABASE_URL
echo      * VITE_SUPABASE_ANON_KEY
echo      * VITE_GEMINI_API_KEY
echo      * VITE_API_BASE (set after backend deployment)
echo.
echo 2. Backend Deployment (Railway):
echo    - Go to https://railway.app
echo    - Create new project from GitHub
echo    - Add environment variables:
echo      * SUPABASE_URL
echo      * SUPABASE_SECRET_KEY
echo      * SUPABASE_PUBLISHABLE_KEY
echo      * GEMINI_API_KEY
echo      * JWT_SECRET
echo      * PORT=5000
echo      * NODE_ENV=production
echo.
echo 3. Connect Frontend to Backend:
echo    - After backend is deployed, update VITE_API_BASE in Vercel
echo    - Redeploy frontend
echo.
echo 📚 Full documentation: see VERCEL_COMPLETE_DEPLOYMENT.md
echo.
pause
