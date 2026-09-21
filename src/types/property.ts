export type PropertyCategory =
  | 'Apartment'
  | 'Villa'
  | 'House'
  | 'Plot'
  | 'Land'
  | 'Farm Land'
  | 'Commercial'
  | 'Office'
  | 'Shop'
  | 'Warehouse'
  | 'Industrial'
  | 'Penthouse'
  | 'Studio'
  | 'Duplex';

export type ListingType =
  | 'For Sale'
  | 'For Rent'
  | 'For Lease'
  | 'New Project';

export type PropertyStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Published'
  | 'Sold'
  | 'Rented'
  | 'Leased'
  | 'Inactive';

export interface PropertyMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'floorPlan' | 'virtualTour';
  caption?: string;
  isCover?: boolean;
}

export interface Property {
  id: string;
  ownerId: string;
  agentId?: string;
  developerId?: string;
  title: string;
  description: string;
  category: PropertyCategory;
  listingType: ListingType;
  propertyType: string;
  status: PropertyStatus;
  price: number;
  currency: string;
  area: number;
  areaUnit: 'sq.ft' | 'sq.m' | 'acres' | 'hectares';
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  amenities: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  media: PropertyMedia[];
  virtualTour?: string;
  floorPlan?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  verified: boolean;
  featured: boolean;
  views: number;
  favorites: number;
  inquiries: number;
}
