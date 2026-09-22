import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ProjectDocument } from '../types/firebaseModels';

const PROJECTS_COL = 'projects';

export const INITIAL_PROJECTS: ProjectDocument[] = [
  {
    projectId: 'proj-prestige-leela',
    name: 'The Leela Residences by Prestige',
    developerName: 'Prestige Estates Projects Ltd',
    developerId: 'agency-prestige-group',
    city: 'Bengaluru',
    locality: 'HAL Old Airport Road',
    address: 'Old Airport Road, Kodihalli, Bengaluru 560008',
    startingPrice: 48000000,
    priceRangeText: '₹4.8 Cr - ₹12.5 Cr',
    configurations: ['3 BHK Luxury', '4 BHK Grand Suite', '5 BHK Presidential Duplex'],
    possessionDate: 'December 2026',
    projectStatus: 'Under Construction',
    reraNumber: 'PRM/KA/RERA/1251/310/PR/170916/000108',
    amenities: [
      'Leela Hotel Concierge Services',
      'Private Temperature-Controlled Infinity Pool',
      'Helipad Access',
      'Private Wine Cellar & Tasting Room',
      'Banqueting Hall & Chef Kitchen',
      'State-of-the-Art Spa & Steam'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80',
    floorPlans: [
      { title: '3 BHK Grande', bhk: '3 BHK', areaSqFt: 3450, price: '₹4.80 Cr', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { title: '4 BHK Presidential', bhk: '4 BHK', areaSqFt: 4650, price: '₹6.90 Cr', image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80' },
      { title: '5 BHK Penthouse', bhk: '5 BHK', areaSqFt: 7200, price: '₹12.50 Cr', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80' }
    ],
    overview: 'An ultra-exclusive collection of hotel-serviced luxury sky residences designed in harmony with The Leela Palace, offering unparalleled hospitality, bespoke butler assistance, and verdant fairway vistas.',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    projectId: 'proj-dlf-camellias',
    name: 'The Camellias by DLF',
    developerName: 'DLF Luxury Developers',
    developerId: 'agency-dlf-partners',
    city: 'Gurugram',
    locality: 'Golf Course Road, DLF 5',
    address: 'DLF Phase 5, Golf Course Road, Gurugram 122009',
    startingPrice: 160000000,
    priceRangeText: '₹16.0 Cr - ₹45.0 Cr',
    configurations: ['4 BHK Penthouse', '5 BHK Grand Duplex', '6 BHK Sky Villa'],
    possessionDate: 'Ready to Move',
    projectStatus: 'Ready to Move',
    reraNumber: 'HRERA-PKL-GGM-12-2018',
    amenities: [
      'Private 18-Hole Gary Player Golf Course Access',
      'Olympic-Sized Lap Pool',
      'Bespoke Health Spa & Turkish Hammam',
      'Exclusive Resident-Only Michelin Dining',
      'Private Cinema Screening Theatre',
      'Multi-Tier Biometric Security'
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    floorPlans: [
      { title: '4 BHK Signature', bhk: '4 BHK', areaSqFt: 7400, price: '₹16.0 Cr', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { title: '5 BHK Sky Villa', bhk: '5 BHK', areaSqFt: 11000, price: '₹28.5 Cr', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80' }
    ],
    overview: 'The benchmark of super-luxury living in India. Set amidst serene golf course greenery, each residence features 12-foot ceilings, floor-to-ceiling panoramic soundproof glass, and world-class concierge infrastructure.',
    createdAt: '2023-11-01T00:00:00.000Z'
  },
  {
    projectId: 'proj-lodha-world-towers',
    name: 'The World Towers by Lodha',
    developerName: 'Lodha Group / Macrotech Developers',
    developerId: 'agency-lodha-partners',
    city: 'Mumbai',
    locality: 'Worli Upper Sea Face',
    address: 'Senapati Bapat Marg, Worli, Mumbai 400013',
    startingPrice: 85000000,
    priceRangeText: '₹8.5 Cr - ₹32.0 Cr',
    configurations: ['3 BHK Sea View', '4 BHK Grand Suite', '5 BHK Sky Mansion'],
    possessionDate: 'Ready to Move',
    projectStatus: 'Ready to Move',
    reraNumber: 'P51900008345',
    amenities: [
      'Iconic Curved Glass Towers Designed by Pei Cobb Freed',
      'Interiors Crafted by Armani / Casa',
      'Private 17-Acre Park Oasis with 600+ Trees',
      'Indoor Heated Sea-Water Pool',
      'Sky Lounge at Level 76 with Arabian Sea Views',
      'Private Helipad and Executive Boardrooms'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80',
    floorPlans: [
      { title: '3 BHK Sea Vista', bhk: '3 BHK', areaSqFt: 2900, price: '₹8.5 Cr', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { title: '4 BHK Horizon Suite', bhk: '4 BHK', areaSqFt: 4200, price: '₹14.2 Cr', image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80' }
    ],
    overview: 'Soaring over the Mumbai skyline, The World Towers is a 117-story architectural marvel offering sweeping views of the Arabian Sea and the city lights, featuring bespoke interior design by Armani/Casa.',
    createdAt: '2023-09-10T00:00:00.000Z'
  },
  {
    projectId: 'proj-sobha-dream-acres',
    name: 'Sobha Victoria Park',
    developerName: 'Sobha Limited',
    developerId: 'agency-sobharealty',
    city: 'Bengaluru',
    locality: 'Hennur Main Road',
    address: 'Hennur Bagalur Road, Off International Airport Road, Bengaluru 560077',
    startingPrice: 19500000,
    priceRangeText: '₹1.95 Cr - ₹4.5 Cr',
    configurations: ['2.5 BHK Victorian', '3 BHK Row House', '4 BHK Luxury Villa'],
    possessionDate: 'March 2027',
    projectStatus: 'Under Construction',
    reraNumber: 'PRM/KA/RERA/1251/446/PR/211022/004374',
    amenities: [
      'Victorian-Themed Architecture & Cobbled Walkways',
      '10,000 sq.ft British Clubhouse',
      'Amphitheatre & French Garden Gazebos',
      'Kids Reflexology Park & Cricket Pitch',
      'Solar-Powered Common Area Lighting',
      'Zero-Discharge Rainwater Harvesting'
    ],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
    floorPlans: [
      { title: '3 BHK Victorian Row House', bhk: '3 BHK', areaSqFt: 2150, price: '₹2.1 Cr', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { title: '4 BHK Heritage Villa', bhk: '4 BHK', areaSqFt: 3400, price: '₹3.9 Cr', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80' }
    ],
    overview: 'An exquisite European-inspired gated villa enclave combining classical Victorian gables with advanced German pre-cast technology, situated close to the Kempegowda International Airport corridor.',
    createdAt: '2024-02-01T00:00:00.000Z'
  }
];

export async function fetchAllProjects(cityFilter?: string): Promise<ProjectDocument[]> {
  try {
    const col = collection(db, PROJECTS_COL);
    let q = query(col);
    if (cityFilter && cityFilter !== 'All') {
      q = query(col, where('city', '==', cityFilter));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as ProjectDocument);
    }
  } catch (err) {
    console.warn('Could not query projects from Firestore:', err);
  }

  if (cityFilter && cityFilter !== 'All') {
    return INITIAL_PROJECTS.filter(p => p.city.toLowerCase() === cityFilter.toLowerCase());
  }
  return INITIAL_PROJECTS;
}

export async function fetchProjectById(projectId: string): Promise<ProjectDocument | null> {
  try {
    const ref = doc(db, PROJECTS_COL, projectId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ProjectDocument;
    }
  } catch (err) {
    console.warn('Could not fetch project by ID:', err);
  }

  return INITIAL_PROJECTS.find(p => p.projectId === projectId) || null;
}

/** Aliases used by ProjectsPage */
export const getProjects = fetchAllProjects;
export const getProjectById = fetchProjectById;
