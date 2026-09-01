#!/bin/bash
# VeerWell Complete Deployment Script
# This script helps set up and deploy VeerWell to Vercel and Railway

set -e

echo "🚀 VeerWell 2.0 Deployment Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Dependencies
echo -e "${YELLOW}[Step 1] Installing dependencies...${NC}"
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Step 2: Build Frontend
echo -e "${YELLOW}[Step 2] Building frontend...${NC}"
cd client
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 3: Build Backend
echo -e "${YELLOW}[Step 3] Building backend...${NC}"
cd server
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 4: Summary
echo -e "${GREEN}✓ Build completed successfully!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Frontend Deployment (Vercel):"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Add environment variables:"
echo "     • VITE_SUPABASE_URL"
echo "     • VITE_SUPABASE_ANON_KEY"
echo "     • VITE_GEMINI_API_KEY"
echo "     • VITE_API_BASE (set after backend deployment)"
echo ""
echo "2. Backend Deployment (Railway):"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub"
echo "   - Add environment variables:"
echo "     • SUPABASE_URL"
echo "     • SUPABASE_SECRET_KEY"
echo "     • SUPABASE_PUBLISHABLE_KEY"
echo "     • GEMINI_API_KEY"
echo "     • JWT_SECRET"
echo "     • PORT=5000"
echo "     • NODE_ENV=production"
echo ""
echo "3. Connect Frontend to Backend:"
echo "   - After backend is deployed, update VITE_API_BASE in Vercel"
echo "   - Redeploy frontend"
echo ""
echo "📚 Full documentation: see VERCEL_COMPLETE_DEPLOYMENT.md"
