# 🚀 MythSeeker Production Deployment Guide

## 📋 **Prerequisites**

Before deploying MythSeeker to production, ensure you have:

- ✅ **Node.js 18+** installed
- ✅ **Firebase CLI** installed (`npm install -g firebase-tools`)
- ✅ **Firebase Project** created and configured
- ✅ **Google Cloud Project** with necessary APIs enabled
- ✅ **Environment Variables** configured

## 🔧 **Environment Setup**

### 1. Firebase Configuration

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Initialize Firebase in your project:**
   ```bash
   firebase init
   ```
   - Select your project
   - Enable Hosting
   - Set public directory to `dist`
   - Configure as SPA (Single Page Application)

3. **Verify Firebase configuration:**
   ```bash
   firebase projects:list
   ```

### 2. Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.production
   ```

2. **Configure your environment variables:**
   ```bash
   # Edit .env.production with your actual values
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... configure all other variables
   ```

3. **Set up Google Cloud credentials:**
   ```bash
   # For local development
   gcloud auth application-default login
   
   # For production (service account)
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
   ```

## 🏗️ **Build Process**

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Performance Testing
```bash
npm run test:performance
```

### Full Test Suite
```bash
npm run test:all
```

## 🚀 **Deployment Options**

### Option 1: Automated Deployment (Recommended)
```bash
npm run deploy
```
This runs the full deployment script with all checks.

### Option 2: Staging Deployment
```bash
npm run deploy:staging
```

### Option 3: Production Deployment
```bash
npm run deploy:production
```

### Option 4: Manual Deployment
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## 📊 **Performance Monitoring**

### Build Performance
- **Type Check:** < 5 seconds
- **Linting:** < 10 seconds  
- **Build Time:** < 30 seconds
- **Bundle Size:** < 1MB total

### Runtime Performance
- **First Contentful Paint:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Memory Usage:** < 50MB

### Monitoring Commands
```bash
# Run performance tests
npm run test:performance

# Check bundle size
npm run build && du -sh dist/

# Monitor memory usage
node --max-old-space-size=8192 scripts/performance-test.js
```

## 🔍 **Quality Assurance**

### Pre-Deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] Performance tests passing
- [ ] Environment variables configured
- [ ] Firebase project selected
- [ ] Build successful
- [ ] Bundle size within limits

### Post-Deployment Verification
- [ ] Application loads correctly
- [ ] Authentication working
- [ ] Database connections established
- [ ] AI services responding
- [ ] Real-time features functional
- [ ] Error boundaries working
- [ ] Loading states displaying

## 🛠️ **Troubleshooting**

### Common Issues

#### Build Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

#### Firebase Deployment Issues
```bash
# Check Firebase login
firebase login --reauth

# Verify project selection
firebase use your-project-id

# Clear Firebase cache
firebase logout && firebase login
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
echo $VITE_FIREBASE_API_KEY

# Check for missing variables
npm run build 2>&1 | grep "VITE_"
```

### Performance Issues

#### Large Bundle Size
1. **Analyze bundle:**
   ```bash
   npm run build
   npm run test:performance
   ```

2. **Optimize imports:**
   - Use dynamic imports for large libraries
   - Implement code splitting
   - Remove unused dependencies

#### Slow Build Times
1. **Check dependencies:**
   ```bash
   npm ls --depth=0
   ```

2. **Optimize Vite config:**
   - Review external dependencies
   - Optimize chunk splitting
   - Enable build caching

## 📈 **Monitoring & Analytics**

### Firebase Analytics
```javascript
// Enable in your app
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics(app);
logEvent(analytics, 'app_opened');
```

### Performance Monitoring
```javascript
// Use the performance hook
import { usePerformance } from './hooks';

const { getMetrics } = usePerformance('ComponentName');
console.log(getMetrics());
```

### Error Tracking
```javascript
// Error boundaries automatically log errors
// Check Firebase Console > Functions > Logs
```

## 🔒 **Security Considerations**

### Environment Variables
- ✅ Never commit `.env.production` to version control
- ✅ Use Firebase Secret Manager for sensitive data
- ✅ Rotate API keys regularly
- ✅ Use least privilege service accounts

### Firebase Security Rules
- ✅ Test security rules with emulators
- ✅ Implement proper authentication checks
- ✅ Validate user permissions
- ✅ Monitor security rule performance

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com/ https://www.googleapis.com;">
```

## 📚 **Additional Resources**

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [TypeScript Performance Tips](https://www.typescriptlang.org/docs/handbook/performance.html)

---

**Need Help?** Check the [MythSeeker Technical Specification](./MYTHSEEKER_TECHNICAL_SPEC.md) or create an issue in the repository. 