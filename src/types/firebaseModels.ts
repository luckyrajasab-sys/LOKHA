export type FirebaseUserRole = 'member' | 'buyer' | 'owner' | 'agent' | 'admin';

export interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  profileImage: string;
  role: FirebaseUserRole;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isPremium?: boolean;
  premiumTier?: 'silver' | 'gold' | 'platinum';
  communicationCount?: number;
}

export type PropertyType =
  | 'Apartment'
  | 'Villa'
  | 'House'
  | 'Penthouse'
  | 'Plot'
  | 'Commercial'
  | 'Office'
  | 'Shop'
  | 'Farmhouse'
  | 'Resort / Homestay';

export type PropertyListingType = 'Sale' | 'Rent' | 'Lease' | 'Stay';

export type PropertyStatusType = 'available' | 'sold' | 'rented' | 'inactive';

export type FurnishedStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';

export interface PropertyDocument {
  propertyId: string;
  ownerId: string;
  ownerName?: string;
  listedByName?: string;
  ownershipType?: 'Self' | 'Family Member' | 'self' | 'family';
  familyMemberName?: string;
  familyRelation?: string;
  familyContactPhone?: string;
  ebConsumerNumber?: string;
  ebProvider?: string;
  ebTariff?: string;
  govDocType?: string;
  govDocNumber?: string;
  isGovEbVerified?: boolean;
  agentId?: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  price: number;
  rentAmount?: number;
  leaseAmount?: number;
  stayNightlyRate?: number;
  stayMaxGuests?: number;
  securityDeposit?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: 'sq.ft' | 'sq.m' | 'acres' | 'hectares';
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: string[];
  videos?: string[];
  status: PropertyStatusType;
  furnishedStatus: FurnishedStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
  isFeatured: boolean;
}

export interface FavoriteDocument {
  propertyId: string;
  createdAt: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface InquiryDocument {
  inquiryId: string;
  propertyId: string;
  propertyTitle?: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  ownerId: string;
  agentId?: string;
  message: string;
  phone: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDocument {
  conversationId: string;
  participants: string[];
  propertyId: string;
  propertyTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  otherParticipantName?: string;
}

export interface MessageDocument {
  messageId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationDocument {
  notificationId: string;
  type: 'inquiry' | 'message' | 'property_update' | 'favorite_update' | 'admin_action' | 'system';
  title: string;
  message: string;
  relatedPropertyId?: string;
  relatedInquiryId?: string;
  isRead: boolean;
  createdAt: string;
}
