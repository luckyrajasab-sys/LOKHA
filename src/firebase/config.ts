import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyByc8rfSWvzvjE3OZgVrN4LMcM6ad6Tvyk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lokha-82898.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lokha-82898",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lokha-82898.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "59896059550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:59896059550:web:cc8abe16000825032c8d8f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SCKY3MTDFR"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
