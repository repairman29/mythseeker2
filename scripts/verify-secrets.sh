#!/bin/bash

echo "🔍 MythSeeker Secret Manager Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check secret
check_secret() {
    local secret_name=$1
    local description=$2
    local required=$3
    
    if gcloud secrets describe "$secret_name" &>/dev/null; then
        if gcloud secrets versions access latest --secret="$secret_name" &>/dev/null; then
            echo -e "${GREEN}✅${NC} $secret_name - $description"
            return 0
        else
            echo -e "${RED}❌${NC} $secret_name - $description (no versions)"
            return 1
        fi
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌${NC} $secret_name - $description (MISSING)"
            return 1
        else
            echo -e "${YELLOW}⚠️${NC} $secret_name - $description (optional, not found)"
            return 0
        fi
    fi
}

echo "📋 Checking required secrets..."
echo ""

# Required Firebase secrets
check_secret "firebase-api-key" "Firebase Web API Key" "true"
check_secret "firebase-auth-domain" "Firebase Auth Domain" "true"
check_secret "firebase-project-id" "Firebase Project ID" "true"
check_secret "firebase-storage-bucket" "Firebase Storage Bucket" "true"
check_secret "firebase-messaging-sender-id" "Firebase Messaging Sender ID" "true"
check_secret "firebase-app-id" "Firebase App ID" "true"

echo ""
echo "🤖 Checking AI service secrets..."
echo ""

# AI service secrets
check_secret "openai-api-key" "OpenAI API Key" "true"
check_secret "vertex-ai-api-key" "Vertex AI API Key" "false"

echo ""
echo "☁️ Checking Google Cloud secrets..."
echo ""

# Google Cloud secrets
check_secret "gcp-access-token" "Google Cloud Access Token" "false"
check_secret "service-account-key" "Service Account JSON Key" "false"

echo ""
echo "📊 Summary:"
echo "==========="

# Count results
total_secrets=0
found_secrets=0
missing_required=0

for secret in "firebase-api-key" "firebase-auth-domain" "firebase-project-id" "firebase-storage-bucket" "firebase-messaging-sender-id" "firebase-app-id" "openai-api-key"; do
    total_secrets=$((total_secrets + 1))
    if gcloud secrets describe "$secret" &>/dev/null && gcloud secrets versions access latest --secret="$secret" &>/dev/null; then
        found_secrets=$((found_secrets + 1))
    else
        missing_required=$((missing_required + 1))
    fi
done

echo "📈 Required secrets: $found_secrets/$total_secrets found"
echo ""

if [ $missing_required -eq 0 ]; then
    echo -e "${GREEN}🎉 All required secrets are configured!${NC}"
    echo ""
    echo "🚀 You can now deploy your application:"
    echo "   npm run deploy"
    echo ""
    echo "📋 Or check deployment status:"
    echo "   npm run monitor"
else
    echo -e "${RED}⚠️ Missing required secrets!${NC}"
    echo ""
    echo "🔧 To add missing secrets:"
    echo "   1. Run: ./scripts/add-secrets.sh"
    echo "   2. Follow the instructions to add missing secrets"
    echo "   3. Re-run this verification script"
    echo ""
    echo "📚 For detailed instructions, see: SECRET_MANAGER_SETUP.md"
fi

echo ""
echo "🔍 For more details, run:"
echo "   gcloud secrets list" 