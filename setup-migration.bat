@echo off
REM VeerWell 2.0 - Database Migration Setup Script
REM This script guides you through applying the database migration

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║  VeerWell 2.0 - Database Schema Migration                                 ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 This script will help you apply the database migration using Supabase CLI
echo.
echo Choose an option:
echo.
echo   1) Automated Setup (Supabase CLI) - Recommended
echo   2) Manual Setup (Copy-Paste SQL)
echo   3) Show Setup Instructions
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto automated
if "%choice%"=="2" goto manual
if "%choice%"=="3" goto instructions
goto invalid

:automated
echo.
echo 🔧 Automated Migration Setup
echo.
echo Step 1: Logging into Supabase CLI...
call supabase login

if errorlevel 1 (
  echo.
  echo ❌ Login failed. Please try again or use Manual Setup (option 2).
  pause
  exit /b 1
)

echo.
echo ✅ Logged in successfully!
echo.
echo Step 2: Linking project...
call supabase link --project-ref krshfwuqifaxecbtrxmy

if errorlevel 1 (
  echo.
  echo ❌ Link failed. Please check your project ID.
  pause
  exit /b 1
)

echo.
echo ✅ Project linked!
echo.
echo Step 3: Pushing migration to database...
call supabase db push

if errorlevel 1 (
  echo.
  echo ⚠️  Migration encountered issues. Check error messages above.
  pause
  exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║  ✅ Migration Complete!                                                    ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo Your database is now ready. You can:
echo   • Refresh the app: http://localhost:3000
echo   • Create a new account
echo   • All data will be saved permanently
echo.
pause
exit /b 0

:manual
echo.
echo 📋 Manual Migration Setup
echo.
echo Follow these steps:
echo.
echo   1. Open Supabase Dashboard:
echo      → https://app.supabase.com
echo.
echo   2. Select your project (krshfwuqifaxecbtrxmy)
echo.
echo   3. Click "SQL Editor" in the left sidebar
echo.
echo   4. Click "+ New Query"
echo.
echo   5. Open the migration SQL file:
echo      → supabase/migrations/0001_veerwell_schema.sql
echo      → Or: server/supabase-migration.sql
echo.
echo   6. Copy ALL the SQL (Ctrl+A → Ctrl+C)
echo.
echo   7. Paste into Supabase SQL Editor
echo.
echo   8. Click the blue "RUN" button
echo.
echo   9. Wait for completion (30-60 seconds)
echo.
echo  10. Check that it says "Query executed successfully"
echo.
echo Once complete, your signup will work with persistent data storage!
echo.
pause
exit /b 0

:instructions
call node "server\migration-helper.mjs"
pause
exit /b 0

:invalid
echo.
echo ❌ Invalid choice. Please run the script again.
echo.
pause
exit /b 1
