#!/bin/bash

# MythSeeker Production Deployment Script
# This script builds and deploys the application to Firebase Hosting

set -e  # Exit on any error

# --- Secret Manager Integration ---
# Fetch secrets from Google Secret Manager and inject into .env.production

# Clean previous env and secret files
rm -f .env.production service-account.json .openai_api_key

# Fetch OpenAI API Key
if gcloud secrets describe openai-api-key &> /dev/null; then
  echo "🔑 Fetching OpenAI API Key from Secret Manager..."
  gcloud secrets versions access latest --secret="openai-api-key" > .openai_api_key
  echo "VITE_OPENAI_API_KEY=$(cat .openai_api_key)" >> .env.production
else
  echo "⚠️  openai-api-key not found in Secret Manager. Skipping."
fi

# Fetch Service Account JSON
if gcloud secrets describe service-account-key &> /dev/null; then
  echo "🔑 Fetching Service Account JSON from Secret Manager..."
  gcloud secrets versions access latest --secret="service-account-key" > service-account.json
  echo "GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/service-account.json" >> .env.production
else
  echo "⚠️  service-account-key not found in Secret Manager. Skipping."
fi

# (Add more secrets here as needed)

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it with 'npm install -g firebase-tools'"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase. Please run 'firebase login' first."
    exit 1
fi

echo "📦 Building application..."

# Clean previous build
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application is now live at: https://your-project-id.web.app" 