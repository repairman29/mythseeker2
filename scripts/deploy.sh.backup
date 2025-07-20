#!/bin/bash

# MythSeeker Production Deployment Script
# This script builds and deploys the application to Firebase Hosting

set -e  # Exit on any error

echo "🚀 MythSeeker Production Deployment"
echo "==================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "🔑 Fetching secrets from Google Secret Manager..."

# Fetch OpenAI API Key
echo "📥 Fetching OpenAI API Key..."
gcloud secrets versions access latest --secret="openai-api-key" > .openai_api_key
echo "VITE_OPENAI_API_KEY=$(cat .openai_api_key)" >> .env.production

# Fetch Firebase Configuration
echo "📥 Fetching Firebase configuration..."
gcloud secrets versions access latest --secret="firebase-api-key" > .firebase_api_key
echo "VITE_FIREBASE_API_KEY=$(cat .firebase_api_key)" >> .env.production

gcloud secrets versions access latest --secret="firebase-auth-domain" > .firebase_auth_domain
echo "VITE_FIREBASE_AUTH_DOMAIN=$(cat .firebase_auth_domain)" >> .env.production

gcloud secrets versions access latest --secret="firebase-project-id" > .firebase_project_id
echo "VITE_FIREBASE_PROJECT_ID=$(cat .firebase_project_id)" >> .env.production

gcloud secrets versions access latest --secret="firebase-storage-bucket" > .firebase_storage_bucket
echo "VITE_FIREBASE_STORAGE_BUCKET=$(cat .firebase_storage_bucket)" >> .env.production

gcloud secrets versions access latest --secret="firebase-messaging-sender-id" > .firebase_messaging_sender_id
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$(cat .firebase_messaging_sender_id)" >> .env.production

gcloud secrets versions access latest --secret="firebase-app-id" > .firebase_app_id
echo "VITE_FIREBASE_APP_ID=$(cat .firebase_app_id)" >> .env.production

# Fetch Google Cloud Configuration
echo "📥 Fetching Google Cloud configuration..."
echo "VITE_GOOGLE_CLOUD_PROJECT_ID=mythseekers-rpg" >> .env.production
echo "VITE_GOOGLE_CLOUD_LOCATION=us-central1" >> .env.production

# Fetch GCP Access Token if available
if gcloud secrets versions access latest --secret="gcp-access-token" > .gcp_access_token 2>/dev/null; then
    echo "VITE_GCP_ACCESS_TOKEN=$(cat .gcp_access_token)" >> .env.production
else
    echo "⚠️  gcp-access-token not found in Secret Manager. Skipping."
fi

# Fetch Vertex AI API Key if available
if gcloud secrets versions access latest --secret="vertex-ai-api-key" > .vertex_ai_api_key 2>/dev/null; then
    echo "VITE_VERTEX_AI_API_KEY=$(cat .vertex_ai_api_key)" >> .env.production
else
    echo "⚠️  vertex-ai-api-key not found in Secret Manager. Skipping."
fi

# Fetch service account key if available
if gcloud secrets versions access latest --secret="service-account-key" > service-account.json 2>/dev/null; then
    echo "GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/service-account.json" >> .env.production
else
    echo "⚠️  service-account-key not found in Secret Manager. Skipping."
fi

# Add application configuration
echo "📝 Adding application configuration..."
echo "VITE_APP_NAME=MythSeeker" >> .env.production
echo "VITE_APP_VERSION=2.0.0" >> .env.production
echo "VITE_APP_ENVIRONMENT=production" >> .env.production
echo "VITE_APP_URL=https://mythseekers-rpg.web.app" >> .env.production

# Add feature flags
echo "VITE_ENABLE_AI_FEATURES=true" >> .env.production
echo "VITE_ENABLE_REAL_TIME=true" >> .env.production
echo "VITE_ENABLE_ANALYTICS=true" >> .env.production
echo "VITE_ENABLE_DEBUG_MODE=false" >> .env.production

# Add performance configuration
echo "VITE_MAX_MESSAGE_HISTORY=100" >> .env.production
echo "VITE_DICE_ROLL_HISTORY_LIMIT=50" >> .env.production
echo "VITE_CAMPAIGN_CACHE_DURATION=300000" >> .env.production

echo "📦 Building application..."

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building for production..."
npm run build

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -f .openai_api_key .firebase_api_key .firebase_auth_domain .firebase_project_id .firebase_storage_bucket .firebase_messaging_sender_id .firebase_app_id .gcp_access_token .vertex_ai_api_key

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is live at: https://mythseekers-rpg.web.app" 