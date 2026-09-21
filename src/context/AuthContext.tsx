import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { logOut } from '../firebase/auth';
import type { UserDocument, FirebaseUserRole } from '../types/firebaseModels';
import type { UserProfile } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  userDoc: UserDocument | null;
  firebaseUser: FirebaseUser | null;
  role: FirebaseUserRole;
  isBuyer: boolean;
  isOwner: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isPrivileged: boolean;
  setUserDirectly: (user: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let docUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);

      // Clean up previous doc listener
      if (docUnsubscribe) {
        docUnsubscribe();
        docUnsubscribe = null;
      }

      if (fbUser) {
        // Real-time listener for the user's document in Firestore (users/{uid})
        docUnsubscribe = onSnapshot(
          doc(db, 'users', fbUser.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              setUserDoc(docSnap.data() as UserDocument);
            } else {
              // Fallback user document if Firestore doc is being created
              setUserDoc({
                uid: fbUser.uid,
                fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                email: fbUser.email || '',
                phone: fbUser.phoneNumber || '',
                profileImage: fbUser.photoURL || '',
                role: 'buyer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
              });
            }
            setLoading(false);
          },
          (err) => {
            console.error('[AuthContext] Firestore onSnapshot error on users doc:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } else {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (docUnsubscribe) docUnsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await logOut();
      setUserDoc(null);
      setFirebaseUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert UserDocument to UserProfile interface for seamless backwards compatibility
  const user: UserProfile | null = userDoc ? {
    id: userDoc.uid,
    displayName: userDoc.fullName,
    email: userDoc.email,
    phone: userDoc.phone,
    photoURL: userDoc.profileImage,
    country: 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: [userDoc.role as any],
    accountType: userDoc.role === 'owner' ? 'Property Owner' : userDoc.role === 'agent' ? 'Agent' : 'Looking to Buy',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    lastLoginAt: userDoc.updatedAt,
    emailVerified: Boolean(firebaseUser?.emailVerified),
    phoneVerified: Boolean(userDoc.phone),
    profileCompleted: Boolean(userDoc.fullName && userDoc.phone),
    status: userDoc.isActive ? 'active' : 'suspended'
  } : null;

  const role: FirebaseUserRole = userDoc?.role || 'buyer';
  const isBuyer = role === 'buyer';
  const isOwner = role === 'owner';
  const isAgent = role === 'agent';
  const isAdmin = role === 'admin';

  const hasRole = (r: string): boolean => {
    if (!userDoc) return false;
    return userDoc.role === r || (userDoc.role === 'admin');
  };

  const isPrivileged = isOwner || isAgent || isAdmin;

  const setUserDirectly = (_newUser: UserProfile | null) => {
    // Kept for backward compatibility, Firestore onSnapshot handles authoritative state
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        firebaseUser,
        role,
        isBuyer,
        isOwner,
        isAgent,
        isAdmin,
        loading,
        error,
        logout,
        hasRole,
        isPrivileged,
        setUserDirectly,
        refreshProfile: async () => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
