#!/bin/bash

# Rakshak - AI Wellness Platform Setup Script
# This script sets up and runs the complete Rakshak platform locally

echo "🚀 Rakshak AI Wellness Platform - Setup & Launch"
echo "=================================================="
echo ""

# Check if running from correct directory
if [ ! -d "Veer-Well" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the VeerWell 2.0 directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Workspace structure verified"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd Veer-Well

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Important: Add your GEMINI_API_KEY to .env file"
    echo "   Export or set: GEMINI_API_KEY=your_api_key_here"
fi

echo "✅ Backend setup complete"
echo ""

# Frontend Setup  
echo "🎨 Setting up Frontend..."
cd ../client

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "✅ Frontend setup complete"
echo ""

# Ready to run
echo "=================================================="
echo "✅ Setup Complete! Ready to launch."
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1️⃣  Terminal 1 - Start Backend Server:"
echo "    cd Veer-Well"
echo "    npm start"
echo "    # Runs on http://localhost:5000"
echo ""
echo "2️⃣  Terminal 2 - Start Frontend Dev Server:"
echo "    cd client"
echo "    npm run dev"
echo "    # Runs on http://localhost:5173"
echo ""
echo "3️⃣  Open browser to http://localhost:5173"
echo "    Default login: Demo users available"
echo ""
echo "🔑 Important:"
echo "   - Ensure GEMINI_API_KEY is set in Veer-Well/.env"
echo "   - Backend must run before frontend"
echo ""
echo "=================================================="
