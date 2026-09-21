import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let initialized = false;

export function getFirebaseAdmin(): typeof admin {
  if (!initialized) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID || 'lokha-82898';

    if (serviceAccountPath) {
      try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId
        });
        console.log('[Firebase Admin] Initialized with service account credentials for project:', projectId);
      } catch (e: any) {
        console.warn('[Firebase Admin] Could not load service account from path, initializing with project ID:', e.message);
        admin.initializeApp({ projectId });
      }
    } else {
      // Default to application default credentials or project ID
      admin.initializeApp({
        projectId
      });
      console.log('[Firebase Admin] Initialized with Project ID:', projectId);
    }
    initialized = true;
  }

  return admin;
}

export default getFirebaseAdmin();
