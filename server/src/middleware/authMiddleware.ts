import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../config/firebaseAdmin.js';
import { query } from '../db/pool.js';

export interface AuthenticatedUser {
  id: string; // Database UUID
  firebase_uid: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Ensures the request is authenticated via Firebase ID Token.
 * Resolves or registers the user in the PostgreSQL `users` table.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.'
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Look up user in PostgreSQL
    let userResult = await query(
      'SELECT id, firebase_uid, name, email, role FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    let user: AuthenticatedUser;

    if (userResult.rows.length === 0) {
      // Sync user to PostgreSQL if missing
      const email = decodedToken.email || `${firebaseUid}@firebase.local`;
      const name = decodedToken.name || email.split('@')[0] || 'User';
      const profileImageUrl = decodedToken.picture || null;
      const initialRole = decodedToken.admin ? 'admin' : (decodedToken.role as string || 'buyer');

      const insertResult = await query(
        `INSERT INTO users (firebase_uid, name, email, profile_image_url, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid, updated_at = NOW()
         RETURNING id, firebase_uid, name, email, role`,
        [firebaseUid, name, email, profileImageUrl, initialRole]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('[AuthMiddleware] Token verification failed:', error.message);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired Firebase authentication token.'
    });
  }
}

/**
 * Optional authentication: Populates req.user if a valid token is present, but allows unauthenticated access.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userResult = await query(
      'SELECT id, firebase_uid, name, email, role FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );
    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    }
  } catch {
    // Ignore invalid tokens for optional routes
  }
  next();
}
