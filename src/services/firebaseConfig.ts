import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - values will be populated from Google Secret Manager
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBDefault',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'mythseekers-rpg.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'mythseekers-rpg',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'mythseekers-rpg.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '659018227506',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:659018227506:web:82425e7adaf80c2e3c412b',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration in production
if (process.env.NODE_ENV === 'production') {
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

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
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