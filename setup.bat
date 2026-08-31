@echo off
REM Rakshak - AI Wellness Platform Setup Script for Windows
REM This script sets up and runs the complete Rakshak platform locally

cls
echo.
echo ================================================
echo   Rakshak AI Wellness Platform - Setup
echo ================================================
echo.

REM Check if running from correct directory
if not exist "Veer-Well" (
    echo Error: Veer-Well folder not found!
    echo Please run this script from the VeerWell 2.0 directory
    pause
    exit /b 1
)

if not exist "client" (
    echo Error: client folder not found!
    echo Please run this script from the VeerWell 2.0 directory
    pause
    exit /b 1
)

echo [OK] Workspace structure verified
echo.

REM Backend Setup
echo Installing Backend...
cd Veer-Well

if not exist "node_modules" (
    echo Running npm install for backend...
    call npm install
)

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Add your GEMINI_API_KEY to .env file
    echo ===============================================
    pause
)

echo [OK] Backend setup complete
echo.

REM Frontend Setup
echo Installing Frontend...
cd ..\client

if not exist "node_modules" (
    echo Running npm install for frontend...
    call npm install
)

echo [OK] Frontend setup complete
echo.

cls
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo -----------
echo.
echo 1. Start Backend Server (in first terminal):
echo    cd Veer-Well
echo    npm start
echo    (Runs on http://localhost:5000)
echo.
echo 2. Start Frontend (in second terminal):
echo    cd client
echo    npm run dev
echo    (Runs on http://localhost:5173)
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo Important:
echo -----------
echo - Set GEMINI_API_KEY in Veer-Well\.env
echo - Start backend BEFORE frontend
echo - Have two terminals/cmd windows open
echo.
echo ================================================
echo.
pause
