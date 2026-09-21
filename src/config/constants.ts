import type { AccountPurpose, UserRole } from '../types/auth';
import type { PropertyCategory, ListingType } from '../types/property';
import type { AccommodationCategory } from '../types/accommodation';

export const ACCOUNT_PURPOSES: AccountPurpose[] = [
  'Looking to Buy',
  'Looking to Rent',
  'Looking to Lease',
  'Looking for Accommodation',
  'Property Owner',
  'Seller',
  'Landlord',
  'Agent',
  'Builder / Developer',
  'Hotel / PG / Hostel Manager'
];

export const PURPOSE_TO_ROLES_MAP: Record<AccountPurpose, UserRole[]> = {
  'Looking to Buy': ['buyer'],
  'Looking to Rent': ['renter'],
  'Looking to Lease': ['renter'],
  'Looking for Accommodation': ['renter'],
  'Property Owner': ['seller', 'landlord'],
  'Seller': ['seller'],
  'Landlord': ['landlord'],
  'Agent': ['agent'], // Privileged: pending approval
  'Builder / Developer': ['builder', 'developer'], // Privileged: pending approval
  'Hotel / PG / Hostel Manager': ['hotel_manager', 'property_manager']
};

export const PRIVILEGED_ROLES: UserRole[] = [
  'agent',
  'builder',
  'developer',
  'admin',
  'moderator'
];

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' }
];

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  'Apartment',
  'Villa',
  'House',
  'Plot',
  'Land',
  'Farm Land',
  'Commercial',
  'Office',
  'Shop',
  'Warehouse',
  'Industrial',
  'Penthouse',
  'Studio',
  'Duplex'
];

export const LISTING_TYPES: ListingType[] = [
  'For Sale',
  'For Rent',
  'For Lease',
  'New Project'
];

export const ACCOMMODATION_CATEGORIES: AccommodationCategory[] = [
  'Hotel',
  'Hostel',
  'PG',
  'Villa',
  'Homestay',
  'Serviced Apartment',
  'Resort',
  'Guest House',
  'Apartment Stay'
];

export const COUNTRIES = [
  { code: 'IN', name: 'India', phoneCode: '+91' },
  { code: 'US', name: 'United States', phoneCode: '+1' },
  { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65' },
  { code: 'CA', name: 'Canada', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', phoneCode: '+61' },
  { code: 'DE', name: 'Germany', phoneCode: '+49' }
];
