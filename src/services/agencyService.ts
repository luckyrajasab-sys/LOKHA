import {
  collection,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AgencyDocument } from '../types/firebaseModels';

const AGENCIES_COL = 'agencies';

export const INITIAL_AGENCIES: AgencyDocument[] = [
  {
    agencyId: 'agency-prestige-group',
    name: 'Prestige Estates Projects Ltd',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=400&q=80',
    description: 'Leading South Indian property development conglomerate with over 35 years of architectural excellence across residential, commercial, and hospitality segments.',
    contactEmail: 'luxury@prestigeconstructions.com',
    phone: '+91 80 2559 1080',
    website: 'https://www.prestigeconstructions.com',
    location: 'Prestige Falcon Tower, Brunton Road',
    city: 'Bengaluru',
    activeProjectsCount: 28,
    completedProjectsCount: 260,
    verificationStatus: 'verified',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    agencyId: 'agency-dlf-partners',
    name: 'DLF Luxury Developers',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    description: 'India premier real estate company known for landmark master-planned developments, luxury golf communities, and premium grade-A commercial complexes.',
    contactEmail: 'sales@dlf.in',
    phone: '+91 124 476 5000',
    website: 'https://www.dlf.in',
    location: 'DLF Cyber City, Phase II',
    city: 'Gurugram',
    activeProjectsCount: 19,
    completedProjectsCount: 310,
    verificationStatus: 'verified',
    createdAt: '2023-02-15T00:00:00.000Z'
  },
  {
    agencyId: 'agency-lodha-partners',
    name: 'Lodha Group / Macrotech Developers',
    logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=80',
    description: 'World-renowned Indian luxury real estate developer delivering globally benchmarked sky residences, private parks, and waterfront mansions.',
    contactEmail: 'contact@lodhagroup.com',
    phone: '+91 22 6133 4400',
    website: 'https://www.lodhagroup.in',
    location: 'Lodha Excelus, NM Joshi Marg',
    city: 'Mumbai',
    activeProjectsCount: 32,
    completedProjectsCount: 280,
    verificationStatus: 'verified',
    createdAt: '2023-04-10T00:00:00.000Z'
  },
  {
    agencyId: 'agency-sobharealty',
    name: 'Sobha Limited',
    logo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
    description: 'India only backward integrated real estate developer celebrated for German quality engineering, bespoke craftsmanship, and sustainable residential communities.',
    contactEmail: 'feedback@sobha.com',
    phone: '+91 80 4932 0000',
    website: 'https://www.sobha.com',
    location: 'Sarjapur - Marathahalli Outer Ring Road',
    city: 'Bengaluru',
    activeProjectsCount: 22,
    completedProjectsCount: 180,
    verificationStatus: 'verified',
    createdAt: '2023-05-20T00:00:00.000Z'
  }
];

export async function fetchAllAgencies(): Promise<AgencyDocument[]> {
  try {
    const col = collection(db, AGENCIES_COL);
    const snap = await getDocs(col);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as AgencyDocument);
    }
  } catch (err) {
    console.warn('Could not query agencies from Firestore:', err);
  }

  return INITIAL_AGENCIES;
}

export async function fetchAgencyById(agencyId: string): Promise<AgencyDocument | null> {
  try {
    const ref = doc(db, AGENCIES_COL, agencyId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as AgencyDocument;
    }
  } catch (err) {
    console.warn('Could not fetch agency by ID:', err);
  }

  return INITIAL_AGENCIES.find(a => a.agencyId === agencyId) || null;
}

/** Alias for fetchAllAgencies — used by AgenciesPage */
export const getVerifiedAgencies = fetchAllAgencies;
