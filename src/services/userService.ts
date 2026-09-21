import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { UserProfile, AccountPurpose, UserRole, UserPreferences } from '../types/auth';

const COLLECTION = 'users';

export interface CreateProfileData {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL?: string;
  country: string;
  accountType: AccountPurpose;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: data.uid || userId,
        displayName: data.fullName || data.displayName || 'User',
        email: data.email || '',
        phone: data.phone || '',
        photoURL: data.profileImage || data.photoURL || '',
        country: data.country || 'India',
        preferredLanguage: 'en',
        preferredCurrency: 'INR',
        roles: data.role ? [data.role] : ['buyer'],
        accountType: data.role === 'owner' ? 'Property Owner' : data.role === 'agent' ? 'Agent' : 'Looking to Buy',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLoginAt: data.updatedAt || new Date().toISOString(),
        emailVerified: true,
        phoneVerified: Boolean(data.phone),
        profileCompleted: true,
        status: data.isActive !== false ? 'active' : 'suspended'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

export async function createUserProfile(data: CreateProfileData): Promise<UserProfile> {
  const role = data.accountType === 'Property Owner' || data.accountType === 'Seller' ? 'owner' :
               data.accountType === 'Agent' ? 'agent' : 'buyer';

  const newProfile = {
    uid: data.id,
    fullName: data.displayName,
    email: data.email,
    phone: data.phone,
    profileImage: data.photoURL || '',
    country: data.country || 'India',
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  };

  const userRef = doc(db, COLLECTION, data.id);
  await setDoc(userRef, newProfile);

  return {
    id: data.id,
    displayName: data.displayName,
    email: data.email,
    phone: data.phone,
    photoURL: data.photoURL,
    country: data.country || 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: [role as UserRole],
    accountType: data.accountType,
    createdAt: newProfile.createdAt,
    updatedAt: newProfile.updatedAt,
    lastLoginAt: newProfile.updatedAt,
    emailVerified: Boolean(data.emailVerified),
    phoneVerified: Boolean(data.phoneVerified),
    profileCompleted: true,
    status: 'active'
  };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, COLLECTION, userId);
  const dataToUpdate: any = {
    updatedAt: new Date().toISOString()
  };

  if (updates.displayName) dataToUpdate.fullName = updates.displayName;
  if (updates.phone) dataToUpdate.phone = updates.phone;
  if (updates.photoURL) dataToUpdate.profileImage = updates.photoURL;
  if (updates.country) dataToUpdate.country = updates.country;

  await updateDoc(userRef, dataToUpdate);
}

export async function updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  const userRef = doc(db, COLLECTION, userId);
  await updateDoc(userRef, {
    preferences,
    profileCompleted: true,
    updatedAt: new Date().toISOString()
  });
}

export async function saveOnboardingPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  return updateUserPreferences(userId, preferences);
}

