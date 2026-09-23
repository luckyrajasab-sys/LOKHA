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
  isVerified?: boolean;
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
  | 'Land'
  | 'Farmhouse'
  | 'Resort / Homestay';

export type PropertyListingType = 'Sale' | 'Rent' | 'Lease' | 'Stay';

export type PropertyStatusType = 'available' | 'active' | 'sold' | 'rented' | 'leased' | 'inactive';

export type VerificationStatusType = 'pending' | 'verified' | 'rejected';

export type FurnishedStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';

export interface PropertyDocument {
  propertyId: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
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
  monthlyRent?: number;
  leaseAmount?: number;
  stayNightlyRate?: number;
  stayMaxGuests?: number;
  securityDeposit?: number;
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  area: number;
  builtUpArea?: number;
  carpetArea?: number;
  plotArea?: number;
  areaUnit: 'sq.ft' | 'sq.m' | 'acres' | 'hectares';
  floor?: number | string;
  totalFloors?: number | string;
  facing?: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  constructionStatus?: 'Ready to Move' | 'Under Construction' | 'New Launch';
  constructionYear?: number;
  possessionDate?: string;
  address: string;
  locality?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: string[];
  floorPlan?: string;
  videos?: string[];
  videoUrl?: string;
  status: PropertyStatusType;
  propertyStatus?: PropertyStatusType;
  verificationStatus?: VerificationStatusType;
  rejectionReason?: string;
  reraNumber?: string;
  reraRegistered?: boolean;
  furnishedStatus: FurnishedStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
  viewsCount?: number;
  favoritesCount?: number;
  enquiryCount?: number;
  isFeatured: boolean;
  // Extended location/specs/compliance fields used by newer pages
  location?: {
    address?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    googleMapsUrl?: string;
  };
  specifications?: {
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    area?: number;
    areaSqFt?: number;
    builtUpArea?: number;
    carpetArea?: number;
    furnishedStatus?: string;
    furnishing?: string;
    parkingSpots?: number;
    parkingSpaces?: number;
    floor?: number | string;
    totalFloors?: number | string;
    facing?: string;
  };
  compliance?: {
    reraNumber?: string;
    reraRegistered?: boolean;
    occupancyCertificate?: boolean;
    approvedByMcgm?: boolean;
    propertyTaxPaid?: boolean;
    clearTitle?: boolean;
    ebConsumerNumber?: string;
    pattaNumber?: string;
  };
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
  buyerPhone?: string;
  ownerId: string;
  agentId?: string;
  message: string;
  phone?: string;
  status: InquiryStatus;
  intent?: 'buy' | 'rent' | 'lease' | 'stay' | 'sell' | 'list' | 'invest' | string;
  propertyType?: string;
  locationDetails?: {
    country?: string;
    state?: string;
    city?: string;
    locality?: string;
  };
  budgetRange?: {
    min?: number;
    max?: number;
  };
  requirements?: {
    bhk?: string;
    areaSqFt?: string;
    furnishing?: string;
    parking?: string;
    amenities?: string[];
  };
  timeline?: string;
  preferredContactMethod?: string;
  additionalRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteVisitStatus = 'pending' | 'requested' | 'confirmed' | 'completed' | 'cancelled';

export interface SiteVisitDocument {
  visitId: string;
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyCity?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  ownerId: string;
  agentId?: string;
  preferredDate: string;
  preferredTime?: string;
  preferredTimeSlot?: string;
  message?: string;
  notes?: string;
  status: SiteVisitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDocument {
  agentId: string;
  uid?: string;
  name: string;
  fullName?: string;  // alias for name
  agencyId?: string;
  agencyName?: string;
  email: string;
  phone: string;
  profileImage: string;
  photoUrl?: string;  // alias for profileImage
  location: string;
  city: string;
  experienceYears: number;
  specializations: string[];
  specialties?: string[];  // alias for specializations
  serviceAreas: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  activeListingsCount: number;
  soldCount: number;
  reraLicenseNumber?: string;
  verificationStatus: 'verified' | 'pending';
  createdAt: string;
}

export interface AgencyDocument {
  agencyId: string;
  name: string;
  logo: string;
  logoUrl?: string;  // alias for logo
  description: string;
  ownerId?: string;
  contactEmail: string;
  phone: string;
  website?: string;
  location: string;
  city: string;
  activeProjectsCount: number;
  completedProjectsCount: number;
  projectsCount?: number;  // alias for activeProjectsCount
  verificationStatus: 'verified' | 'pending';
  createdAt: string;
}

export interface ProjectDocument {
  projectId: string;
  name: string;
  title?: string;  // alias for name
  developerName: string;
  developerId?: string;
  city: string;
  locality: string;
  location?: string;  // alias for locality
  address: string;
  description?: string;  // alias for overview
  startingPrice: number;
  priceRangeText: string;
  configurations: string[];
  possessionDate: string;
  projectStatus: 'New Launch' | 'Under Construction' | 'Ready to Move';
  reraNumber: string;
  amenities: string[];
  images: string[];
  bannerImage: string;
  floorPlans?: { title: string; bhk: string; areaSqFt: number; price: string; image: string }[];
  overview: string;
  createdAt: string;
}

export interface ValuationRequestDocument {
  valuationId: string;
  userId?: string;
  propertyType: string;
  city: string;
  locality: string;
  areaSqFt: number;
  bhk: string;
  ageYears: number;
  furnishing: string;
  expectedPrice?: number;
  estimatedLowPrice: number;
  estimatedHighPrice: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  // Extended fields used by HomeValuationPage
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  microMarket?: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  notes?: string;
  status: 'estimated' | 'advisor_assigned' | 'completed';
  createdAt: string;
}

export interface ReportDocument {
  reportId: string;
  propertyId: string;
  propertyTitle?: string;
  reportedBy?: string;
  reportedByUserId?: string;
  reporterEmail?: string;
  reason: string;
  description?: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface ContactMessageDocument {
  messageId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  createdAt: string;
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
  type:
    | 'inquiry'
    | 'message'
    | 'property_update'
    | 'favorite_update'
    | 'admin_action'
    | 'site_visit'
    | 'system';
  title: string;
  message: string;
  relatedPropertyId?: string;
  relatedInquiryId?: string;
  relatedVisitId?: string;
  isRead: boolean;
  createdAt: string;
}
