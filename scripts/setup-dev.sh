#!/bin/bash

echo "🚀 MythSeeker Development Environment Setup"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📋 Prerequisites Check:"
echo "======================"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅${NC} Node.js is installed"
else
    echo -e "${RED}❌${NC} Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅${NC} npm is installed"
else
    echo -e "${RED}❌${NC} npm is not installed"
    exit 1
fi

# Check if Firebase CLI is installed
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✅${NC} Firebase CLI is installed"
else
    echo -e "${YELLOW}⚠️${NC} Firebase CLI is not installed"
    echo "   Run: npm install -g firebase-tools"
fi

# Check if gcloud CLI is installed
if command -v gcloud &> /dev/null; then
    echo -e "${GREEN}✅${NC} Google Cloud CLI is installed"
else
    echo -e "${YELLOW}⚠️${NC} Google Cloud CLI is not installed"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
fi

echo ""
echo "📦 Installing Dependencies:"
echo "=========================="

# Install npm dependencies
if [ -f "package.json" ]; then
    echo "Installing npm dependencies..."
    npm install
    echo -e "${GREEN}✅${NC} Dependencies installed"
else
    echo -e "${RED}❌${NC} package.json not found"
    exit 1
fi

echo ""
echo "🔧 Development Configuration:"
echo "============================"

# Check if .env.development exists
if [ -f ".env.development" ]; then
    echo -e "${GREEN}✅${NC} Development environment file exists"
else
    echo -e "${YELLOW}⚠️${NC} Creating development environment file..."
    cat > .env.development << EOF
# MythSeeker Development Environment
VITE_FIREBASE_API_KEY=AIzaSyBDefault
VITE_FIREBASE_AUTH_DOMAIN=mythseekers-rpg.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mythseekers-rpg
VITE_FIREBASE_STORAGE_BUCKET=mythseekers-rpg.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=659018227506
VITE_FIREBASE_APP_ID=1:659018227506:web:82425e7adaf80c2e3c412b
VITE_GOOGLE_CLOUD_PROJECT_ID=mythseekers-rpg
VITE_APP_ENVIRONMENT=development
EOF
    echo -e "${GREEN}✅${NC} Development environment file created"
fi

echo ""
echo "🔥 Firebase Emulator Setup:"
echo "==========================="

# Check if Firebase emulators are configured
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅${NC} Firebase configuration exists"
else
    echo -e "${YELLOW}⚠️${NC} Firebase configuration not found"
fi

echo ""
echo "🚀 Starting Development Server:"
echo "=============================="

echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To start Firebase emulators, run:"
echo "  firebase emulators:start"
echo ""
echo "To get Firebase API key for production:"
echo "  npm run get-firebase-config"
echo ""
echo "To verify secrets:"
echo "  npm run verify-secrets"
echo ""

echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "1. Get Firebase API key: npm run get-firebase-config"
echo "2. Add API key to Secret Manager"
echo "3. Start development: npm run dev"
echo "4. Test authentication flow" 