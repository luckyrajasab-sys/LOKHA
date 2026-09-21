export type UserRole =
  | 'buyer'
  | 'renter'
  | 'seller'
  | 'landlord'
  | 'agent'
  | 'property_manager'
  | 'hotel_manager'
  | 'hostel_manager'
  | 'pg_manager'
  | 'builder'
  | 'developer'
  | 'admin'
  | 'moderator';

export type AccountPurpose =
  | 'Looking to Buy'
  | 'Looking to Rent'
  | 'Looking to Lease'
  | 'Looking for Accommodation'
  | 'Property Owner'
  | 'Seller'
  | 'Landlord'
  | 'Agent'
  | 'Builder / Developer'
  | 'Hotel / PG / Hostel Manager';

export interface UserPreferences {
  lookingFor: 'Buy' | 'Rent' | 'Lease' | 'Stay';
  preferredLocations: string[];
  propertyTypes: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL?: string;
  country: string;
  preferredLanguage: string;
  preferredCurrency: string;
  roles: UserRole[];
  accountType: AccountPurpose;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  status: 'active' | 'pending' | 'suspended';
  preferences?: UserPreferences;
  companyName?: string;
  licenseNumber?: string;
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: any | null;
  loading: boolean;
  error: string | null;
}
