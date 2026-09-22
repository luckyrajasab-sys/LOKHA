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
  const [directUser, setDirectUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('lokha_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
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
            console.warn('[AuthContext] Firestore onSnapshot warning on users doc:', err);
            setUserDoc((prev) => prev || {
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
            setLoading(false);
          }
        );
      } else {
        setUserDoc(null);
        // Rehydrate directUser from localStorage if present
        try {
          const cached = localStorage.getItem('lokha_cached_user');
          if (cached) {
            setDirectUser(JSON.parse(cached));
          } else {
            setDirectUser(null);
          }
        } catch {
          setDirectUser(null);
        }
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
      setDirectUser(null);
      try {
        localStorage.removeItem('lokha_cached_user');
      } catch {
        // ignore
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const computedFromFb: UserProfile | null = firebaseUser ? {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    photoURL: firebaseUser.photoURL || '',
    country: 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: ['member'],
    accountType: 'Verified Member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailVerified: Boolean(firebaseUser.emailVerified),
    phoneVerified: Boolean(firebaseUser.phoneNumber),
    profileCompleted: Boolean(firebaseUser.displayName),
    status: 'active'
  } : null;

  // Convert UserDocument to UserProfile interface, with fallback to directUser / computedFromFb
  const user: UserProfile | null = userDoc ? {
    id: userDoc.uid,
    displayName: userDoc.fullName,
    email: userDoc.email,
    phone: userDoc.phone,
    photoURL: userDoc.profileImage,
    country: 'India',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    roles: ['member'],
    accountType: 'Verified Member',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    lastLoginAt: userDoc.updatedAt,
    emailVerified: Boolean(firebaseUser?.emailVerified),
    phoneVerified: Boolean(userDoc.phone),
    profileCompleted: Boolean(userDoc.fullName && userDoc.phone),
    status: userDoc.isActive ? 'active' : 'suspended'
  } : (directUser || computedFromFb);

  const role: FirebaseUserRole = userDoc?.role === 'admin' ? 'admin' : 'member';
  // All verified members can buy, rent, lease, stay, and list/give their properties!
  const isBuyer = Boolean(user);
  const isOwner = Boolean(user);
  const isAgent = Boolean(user);
  const isAdmin = role === 'admin' || userDoc?.role === 'admin';
  const isPrivileged = Boolean(user);

  const hasRole = (_r: string): boolean => {
    return Boolean(user);
  };

  const setUserDirectly = (newUser: UserProfile | null) => {
    setDirectUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem('lokha_cached_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('lokha_cached_user');
      }
    } catch (e) {
      console.warn('[AuthContext] LocalStorage write error:', e);
    }
    setLoading(false);
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
