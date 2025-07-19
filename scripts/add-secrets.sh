#!/bin/bash

echo "🔐 MythSeeker Secret Manager Setup"
echo "=================================="
echo ""

echo "📋 Secrets already created:"
echo "✅ firebase-auth-domain: mythseekers-rpg.firebaseapp.com"
echo "✅ firebase-project-id: mythseekers-rpg"
echo "✅ firebase-storage-bucket: mythseekers-rpg.appspot.com"
echo "✅ firebase-messaging-sender-id: 659018227506"
echo "✅ firebase-app-id: 1:659018227506:web:82425e7adaf80c2e3c412b"
echo "✅ openai-api-key: [already exists]"
echo "✅ vertex-ai-api-key: [already exists]"
echo ""

echo "🔑 Secrets that need to be added manually:"
echo ""

echo "1. Firebase API Key:"
echo "   - Go to Firebase Console > Project Settings > General"
echo "   - Copy the 'Web API Key'"
echo "   - Run: echo 'YOUR_API_KEY' | gcloud secrets versions add firebase-api-key --data-file=-"
echo ""

echo "2. Google Cloud Access Token (if needed):"
echo "   - This is usually handled automatically by service accounts"
echo "   - Run: echo 'YOUR_ACCESS_TOKEN' | gcloud secrets versions add gcp-access-token --data-file=-"
echo ""

echo "3. Additional secrets you might want to add:"
echo "   - firebase-measurement-id (for analytics)"
echo "   - any-other-api-keys"
echo ""

echo "📝 To add a secret manually:"
echo "   gcloud secrets create SECRET_NAME --replication-policy='automatic'"
echo "   echo 'SECRET_VALUE' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""

echo "🔍 To list all secrets:"
echo "   gcloud secrets list"
echo ""

echo "✅ Once all secrets are added, update the deployment script to fetch them!" 