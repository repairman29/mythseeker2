import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - values will be populated from Google Secret Manager
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAVJvau3Hit06q1pNYCTOF-pVuutmk4oNQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mythseekers-rpg.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mythseekers-rpg',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mythseekers-rpg.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '659018227506',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:659018227506:web:defe583bf99f47a63c412b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-H4M5WRTMFV'
};

// Debug: Log the API key being used (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 Firebase Config Debug:');
  console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Using fallback');
  console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('Full Config:', {
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
}

// Validate required configuration in production
if (import.meta.env.PROD) {
  const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  for (const key of requiredConfig) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      throw new Error(`Missing required Firebase configuration: ${key}`);
    }
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Connect to emulators in development (only if explicitly enabled)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  const hostname = 'localhost';
  
  // Connect to emulators (will silently fail if already connected)
  try {
    connectAuthEmulator(auth, `http://${hostname}:9099`);
  } catch (error) {
    console.log('Auth emulator already connected or failed to connect');
  }
  
  try {
    connectFirestoreEmulator(db, hostname, 8080);
  } catch (error) {
    console.log('Firestore emulator already connected or failed to connect');
  }
  
  try {
    connectFunctionsEmulator(functions, hostname, 5001);
  } catch (error) {
    console.log('Functions emulator already connected or failed to connect');
  }
  
  try {
    connectStorageEmulator(storage, hostname, 9199);
  } catch (error) {
    console.log('Storage emulator already connected or failed to connect');
  }
}

export default app; 