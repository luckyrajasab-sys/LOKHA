import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import type { UserDocument, FirebaseUserRole } from '../types/firebaseModels';

const USERS_COLLECTION = 'users';

/**
 * Register a new user with Email and Password and create users/{uid} document
 */
export async function signUpWithEmail(
  fullName: string,
  email: string,
  pass: string,
  phone = '',
  role: FirebaseUserRole = 'buyer'
): Promise<UserDocument> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  const now = new Date().toISOString();
  const userDoc: UserDocument = {
    uid: fbUser.uid,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    profileImage: '',
    role,
    createdAt: now,
    updatedAt: now,
    isActive: true
  };

  try {
    await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), userDoc);
  } catch (err) {
    console.warn('[Firebase Auth] Note: Firestore user document write skipped or delayed:', err);
  }
  return userDoc;
}

/**
 * Log in an existing user with Email and Password
 */
export async function logInWithEmail(email: string, pass: string): Promise<UserDocument> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  let userDoc: UserDocument | null = null;
  try {
    userDoc = await getUserDocument(fbUser.uid);
  } catch (err) {
    console.warn('[Firebase Auth] Note: Could not fetch user doc:', err);
  }

  if (!userDoc) {
    // If document is missing, create it
    const now = new Date().toISOString();
    userDoc = {
      uid: fbUser.uid,
      fullName: fbUser.displayName || email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: fbUser.phoneNumber || '',
      profileImage: fbUser.photoURL || '',
      role: 'buyer',
      createdAt: now,
      updatedAt: now,
      isActive: true
    };
    try {
      await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), userDoc);
    } catch (err) {
      console.warn('[Firebase Auth] Note: Firestore user doc write skipped or delayed:', err);
    }
  }

  return userDoc;
}

/**
 * Sign in or sign up with Google
 */
export async function logInWithGoogle(): Promise<UserDocument> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  let userDoc: UserDocument | null = null;
  try {
    userDoc = await getUserDocument(fbUser.uid);
  } catch (err) {
    console.warn('[Firebase Auth] Note: Could not fetch user doc:', err);
  }

  if (!userDoc) {
    const now = new Date().toISOString();
    userDoc = {
      uid: fbUser.uid,
      fullName: fbUser.displayName || 'Google User',
      email: (fbUser.email || '').toLowerCase(),
      phone: fbUser.phoneNumber || '',
      profileImage: fbUser.photoURL || '',
      role: 'buyer',
      createdAt: now,
      updatedAt: now,
      isActive: true
    };
    try {
      await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), userDoc);
    } catch (err) {
      console.warn('[Firebase Auth] Note: Firestore user doc write skipped or delayed:', err);
    }
  }

  return userDoc;
}

/**
 * Log out current authenticated session
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Fetch users/{uid} document
 */
export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (snap.exists()) {
      return snap.data() as UserDocument;
    }
    return null;
  } catch (err) {
    console.error('[Firebase Auth] Error reading user doc:', err);
    return null;
  }
}

/**
 * Update user document fields
 */
export async function updateUserProfile(uid: string, updates: Partial<Omit<UserDocument, 'uid' | 'createdAt'>>): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Update a user's role (Admin operation)
 */
export async function updateUserRole(uid: string, newRole: FirebaseUserRole): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, {
    role: newRole,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Toggle user active status (Admin operation)
 */
export async function toggleUserActiveStatus(uid: string, isActive: boolean): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, {
    isActive,
    updatedAt: new Date().toISOString()
  });
}

export { onAuthStateChanged, type FirebaseUser };
