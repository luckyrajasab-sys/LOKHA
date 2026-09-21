import {
  signUpWithEmail,
  logInWithEmail,
  logInWithGoogle,
  logOut,
  resetPassword,
  updateUserProfile as updateFirebaseUserProfile
} from '../firebase/auth';
import { auth, db } from '../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, deleteUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import type { UserProfile, AccountPurpose } from '../types/auth';
import type { FirebaseUserRole, UserDocument } from '../types/firebaseModels';

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters with a mix of numbers and letters.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window closed before completing authentication.';
    default:
      return 'An unexpected authentication error occurred. Please try again.';
  }
}

function userDocToProfile(doc: UserDocument): UserProfile {
  return {
    id: doc.uid,
    displayName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    photoURL: doc.profileImage,
    country: 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: [doc.role as any],
    accountType: doc.role === 'owner' ? 'Property Owner' : doc.role === 'agent' ? 'Agent' : 'Looking to Buy',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastLoginAt: doc.updatedAt,
    emailVerified: true,
    phoneVerified: Boolean(doc.phone),
    profileCompleted: true,
    status: doc.isActive ? 'active' : 'suspended'
  };
}

export async function registerWithEmail(
  fullName: string,
  email: string,
  phone: string,
  pass: string,
  _country: string,
  accountType: AccountPurpose
): Promise<UserProfile> {
  // Map account purpose to requested role
  let role: FirebaseUserRole = 'buyer';
  if (accountType === 'Property Owner' || accountType === 'Seller' || accountType === 'Landlord') {
    role = 'owner';
  } else if (accountType === 'Agent' || accountType === 'Builder / Developer') {
    role = 'agent';
  }

  const doc = await signUpWithEmail(fullName, email, pass, phone, role);
  return userDocToProfile(doc);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const doc = await logInWithEmail(email, pass);
  return userDocToProfile(doc);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const doc = await logInWithGoogle();
  return userDocToProfile(doc);
}

export async function loginWithApple(): Promise<UserProfile> {
  // Fallback to Google if Apple is not configured
  return loginWithGoogle();
}

export async function logoutUser(): Promise<void> {
  await logOut();
}

export function initRecaptcha(elementId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, elementId, {
    size: 'invisible'
  });
}

export async function requestPhoneOTP(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<any> {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export async function confirmPhoneOTP(confirmationResult: any, otpCode: string, phoneNumber?: string): Promise<UserProfile> {
  const result = await confirmationResult.confirm(otpCode);
  const fbUser = result.user;
  return {
    id: fbUser.uid,
    displayName: fbUser.displayName || 'Phone User',
    email: fbUser.email || '',
    phone: fbUser.phoneNumber || phoneNumber || '',
    photoURL: fbUser.photoURL || '',
    country: 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: ['buyer'],
    accountType: 'Looking to Buy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailVerified: true,
    phoneVerified: true,
    profileCompleted: true,
    status: 'active'
  };
}

export async function deleteCurrentUser(): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Ignore if doc doesn't exist
    }
    await deleteUser(currentUser);
  }
}

export { resetPassword, updateFirebaseUserProfile };
