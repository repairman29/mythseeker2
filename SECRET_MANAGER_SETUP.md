# 🔐 Google Secret Manager Setup for MythSeeker

## 📋 Overview

All sensitive information for MythSeeker is now stored securely in Google Secret Manager. This provides:

- ✅ **Centralized secret management**
- ✅ **Version control for secrets**
- ✅ **Fine-grained access control**
- ✅ **Audit logging**
- ✅ **Automatic rotation capabilities**

## 🗂️ Secrets Structure

### **Firebase Configuration**
| Secret Name | Description | Value |
|-------------|-------------|-------|
| `firebase-api-key` | Firebase Web API Key | `AIzaSy...` |
| `firebase-auth-domain` | Firebase Auth Domain | `mythseekers-rpg.firebaseapp.com` |
| `firebase-project-id` | Firebase Project ID | `mythseekers-rpg` |
| `firebase-storage-bucket` | Firebase Storage Bucket | `mythseekers-rpg.appspot.com` |
| `firebase-messaging-sender-id` | Firebase Messaging Sender ID | `659018227506` |
| `firebase-app-id` | Firebase App ID | `1:659018227506:web:82425e7adaf80c2e3c412b` |

### **AI Service Keys**
| Secret Name | Description | Value |
|-------------|-------------|-------|
| `openai-api-key` | OpenAI API Key | `sk-...` |
| `vertex-ai-api-key` | Google Vertex AI API Key | `...` |

### **Google Cloud Configuration**
| Secret Name | Description | Value |
|-------------|-------------|-------|
| `gcp-access-token` | Google Cloud Access Token | `ya29...` |
| `service-account-key` | Service Account JSON Key | `{...}` |

## 🚀 Setup Instructions

### **1. Create Missing Secrets**

Run the setup script to see what's missing:
```bash
./scripts/add-secrets.sh
```

### **2. Add Firebase API Key**

Get your Firebase API Key:
1. Go to [Firebase Console](https://console.firebase.google.com/project/mythseekers-rpg/settings/general)
2. Navigate to Project Settings > General
3. Copy the "Web API Key"
4. Add to Secret Manager:
```bash
echo "YOUR_FIREBASE_API_KEY" | gcloud secrets versions add firebase-api-key --data-file=-
```

### **3. Add Additional Secrets (Optional)**

```bash
# Add Firebase Measurement ID (for analytics)
echo "G-XXXXXXXXXX" | gcloud secrets versions add firebase-measurement-id --data-file=-

# Add any other API keys
echo "YOUR_API_KEY" | gcloud secrets versions add your-secret-name --data-file=-
```

## 🔧 Usage in Code

### **Environment Variables**

The deployment scripts automatically fetch secrets and create environment variables:

```bash
# These are automatically populated during deployment
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_OPENAI_API_KEY=...
```

### **Access in Application**

```typescript
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};

// AI service
const openAiKey = process.env.VITE_OPENAI_API_KEY;
```

## 🔄 Deployment Integration

### **Local Deployment**
```bash
npm run deploy
```

### **GitHub Actions**
Automatically fetches secrets during CI/CD pipeline.

### **Manual Secret Fetching**
```bash
# Fetch a specific secret
gcloud secrets versions access latest --secret="firebase-api-key"

# Fetch all secrets for local development
./scripts/deploy.sh
```

## 🛡️ Security Best Practices

### **Access Control**
- Only service accounts with `secretmanager.secretAccessor` role can access secrets
- GitHub Actions uses dedicated service account
- Local development uses your personal credentials

### **Secret Rotation**
```bash
# Add new version of a secret
echo "NEW_SECRET_VALUE" | gcloud secrets versions add secret-name --data-file=-

# List versions
gcloud secrets versions list secret-name

# Delete old version (optional)
gcloud secrets versions destroy secret-name/VERSION_NUMBER
```

### **Audit Logging**
```bash
# View access logs
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret"
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Permission Denied**
   ```bash
   # Check if you have access
   gcloud secrets list
   
   # Grant access if needed
   gcloud projects add-iam-policy-binding mythseekers-rpg \
     --member="user:your-email@domain.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

2. **Secret Not Found**
   ```bash
   # List all secrets
   gcloud secrets list
   
   # Check if secret exists
   gcloud secrets describe secret-name
   ```

3. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify all required secrets exist
   - Ensure service account has proper permissions

### **Debug Commands**

```bash
# List all secrets
gcloud secrets list

# View secret metadata
gcloud secrets describe secret-name

# Test secret access
gcloud secrets versions access latest --secret="secret-name"

# Check service account permissions
gcloud projects get-iam-policy mythseekers-rpg \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:github-actions@mythseekers-rpg.iam.gserviceaccount.com"
```

## 📊 Monitoring

### **Secret Usage**
- Monitor access patterns in Google Cloud Console
- Set up alerts for unusual access patterns
- Review audit logs regularly

### **Health Checks**
```bash
# Verify all secrets are accessible
./scripts/verify-secrets.sh
```

## 🔄 Migration from Environment Files

If you have secrets in `.env` files:

1. **Backup current values**
2. **Add to Secret Manager**
3. **Update deployment scripts**
4. **Remove from `.env` files**
5. **Test deployment**

## 📚 Additional Resources

- [Google Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)
- [GitHub Actions with GCP](https://github.com/google-github-actions/setup-gcloud)

---

**🔐 Your secrets are now securely managed in Google Secret Manager!** 