export type ProjectStatus =
  | 'Pre-Launch'
  | 'New Launch'
  | 'Under Construction'
  | 'Ready to Move';

export interface ProjectOffer {
  id: string;
  projectId: string;
  developerId: string;
  offerTitle: string;
  description: string;
  validFrom: string;
  validUntil: string;
  terms: string;
  status: 'active' | 'expired' | 'upcoming';
  discountValue?: string;
}

export interface ProjectUnit {
  id: string;
  unitType: string;
  bedrooms: number;
  bathrooms: number;
  carpetArea: number;
  price: number;
  currency: string;
  availableUnits: number;
  totalUnits: number;
  floorPlanUrl?: string;
}

export interface BuilderProject {
  id: string;
  developerId: string;
  developerName: string;
  developerLogo?: string;
  projectName: string;
  tagline?: string;
  location: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  projectStatus: ProjectStatus;
  startingPrice: number;
  maxPrice: number;
  currency: string;
  unitTypes: string[];
  availableUnits: number;
  totalUnits: number;
  amenities: string[];
  projectImages: string[];
  brochureUrl?: string;
  reraId?: string;
  possessionDate: string;
  offers: ProjectOffer[];
  verified: boolean;
  featured: boolean;
  createdAt: string;
}
