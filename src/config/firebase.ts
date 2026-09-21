import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyByc8rfSWvzvjE3OZgVrN4LMcM6ad6Tvyk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lokha-82898.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lokha-82898",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lokha-82898.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "59896059550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:59896059550:web:cc8abe16000825032c8d8f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SCKY3MTDFR"
};

// Check if Firebase is active
export const isFirebaseConfigured = true;

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Analytics safely in browser
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported in this environment:', err);
  });
}

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export { app };
export default app;
