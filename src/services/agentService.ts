import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AgentDocument, PropertyDocument } from '../types/firebaseModels';

const AGENTS_COL = 'agents';
const PROPERTIES_COL = 'properties';

export const INITIAL_AGENTS: AgentDocument[] = [
  {
    agentId: 'agent-rajesh-sharma',
    name: 'Rajesh V. Sharma',
    agencyId: 'agency-prestige-group',
    agencyName: 'Prestige Luxury Estates',
    email: 'rajesh.sharma@prestigerealty.in',
    phone: '+91 98401 23456',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    location: 'Boat Club Road, RA Puram',
    city: 'Chennai',
    experienceYears: 14,
    specializations: ['Luxury Waterfront Villas', 'Colonial Heritage Bungalows', 'NRI Investments'],
    serviceAreas: ['RA Puram', 'Boat Club', 'Poes Garden', 'ECR Beachfront'],
    bio: 'Senior Luxury Real Estate Consultant with over 14 years specializing in prime South Indian luxury corridors and high-yield commercial assets.',
    rating: 4.95,
    reviewCount: 48,
    activeListingsCount: 18,
    soldCount: 142,
    verificationStatus: 'verified',
    createdAt: '2024-01-10T00:00:00.000Z'
  },
  {
    agentId: 'agent-priya-menon',
    name: 'Priya K. Menon',
    agencyId: 'agency-sobharealty',
    agencyName: 'Sobha Prime Corridors',
    email: 'priya.menon@sobharealty.in',
    phone: '+91 98840 54321',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    location: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    experienceYears: 11,
    specializations: ['Silicon Valley Penthouses', 'Gated Villa Enclaves', 'Commercial Tech Parks'],
    serviceAreas: ['Indiranagar', 'Koramangala', 'Lavelle Road', 'Whitefield'],
    bio: 'Dedicated estate advisor catering to founders, corporate executives, and global investors seeking signature residences across Bengaluru.',
    rating: 4.92,
    reviewCount: 39,
    activeListingsCount: 14,
    soldCount: 98,
    verificationStatus: 'verified',
    createdAt: '2024-03-15T00:00:00.000Z'
  },
  {
    agentId: 'agent-vikram-singh',
    name: 'Vikramaditya Singh',
    agencyId: 'agency-dlf-partners',
    agencyName: 'DLF Platinum Associates',
    email: 'vikram.singh@dlfplatinum.in',
    phone: '+91 99100 87654',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    location: 'Golf Course Road, DLF Phase 5',
    city: 'Gurugram',
    experienceYears: 16,
    specializations: ['Golf View Condominiums', 'Lutyens Bungalows', 'Ultra Luxury Duplexes'],
    serviceAreas: ['Golf Course Road', 'Chanakyapuri', 'Jor Bagh', 'Sohna Road'],
    bio: 'Distinguished Delhi-NCR realty strategist managing bespoke acquisitions for diplomatic missions and premier corporate headquarters.',
    rating: 4.98,
    reviewCount: 62,
    activeListingsCount: 22,
    soldCount: 185,
    verificationStatus: 'verified',
    createdAt: '2023-11-20T00:00:00.000Z'
  },
  {
    agentId: 'agent-rohit-mehta',
    name: 'Rohit Mehta',
    agencyId: 'agency-lodha-partners',
    agencyName: 'Lodha Crown Partners',
    email: 'rohit.mehta@lodhacrown.in',
    phone: '+91 98200 11223',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'Bandra West, Pali Hill',
    city: 'Mumbai',
    experienceYears: 15,
    specializations: ['Sea View Mansions', 'Worli High-Rises', 'Celebrity Estates'],
    serviceAreas: ['Bandra West', 'Juhu Beach', 'Worli Sea Face', 'Malabar Hill'],
    bio: 'Mumbai luxury market veteran specializing in prime sea-facing penthouses, historic bungalows, and confidential private estate placements.',
    rating: 4.96,
    reviewCount: 54,
    activeListingsCount: 19,
    soldCount: 160,
    verificationStatus: 'verified',
    createdAt: '2023-08-12T00:00:00.000Z'
  }
];

export async function fetchAllAgents(cityFilter?: string): Promise<AgentDocument[]> {
  try {
    const col = collection(db, AGENTS_COL);
    let q = query(col);
    if (cityFilter && cityFilter !== 'All') {
      q = query(col, where('city', '==', cityFilter));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as AgentDocument);
    }
  } catch (err) {
    console.warn('Could not query agents from Firestore:', err);
  }

  // Fallback to verified seed agents
  if (cityFilter && cityFilter !== 'All') {
    return INITIAL_AGENTS.filter(a => a.city.toLowerCase() === cityFilter.toLowerCase());
  }
  return INITIAL_AGENTS;
}

export async function fetchAgentById(agentId: string): Promise<AgentDocument | null> {
  try {
    const ref = doc(db, AGENTS_COL, agentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as AgentDocument;
    }
  } catch (err) {
    console.warn('Could not fetch agent by ID:', err);
  }

  return INITIAL_AGENTS.find(a => a.agentId === agentId) || null;
}

export async function fetchAgentListings(agentId: string): Promise<PropertyDocument[]> {
  try {
    const q = query(collection(db, PROPERTIES_COL), where('agentId', '==', agentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PropertyDocument);
  } catch {
    return [];
  }
}

/** Aliases used by AgentsPage */
export const getVerifiedAgents = fetchAllAgents;
export const getAgentById = fetchAgentById;
export const getAgentListings = fetchAgentListings;
