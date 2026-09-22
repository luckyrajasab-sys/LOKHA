import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ValuationRequestDocument } from '../types/firebaseModels';

const VALUATIONS_COL = 'valuations';

// Baseline rates per sq.ft across Indian Tier-1 and Tier-2 luxury corridors
const CITY_BASE_RATES: Record<string, number> = {
  mumbai: 38000,
  delhi: 28000,
  gurugram: 18500,
  bengaluru: 12500,
  chennai: 11000,
  hyderabad: 9500,
  pune: 10500,
  goa: 14000,
  kochi: 8500,
  coimbatore: 7200,
  default: 9000
};

export function computeEstimatedValuation(
  city: string,
  areaSqFt: number,
  propertyType: string,
  ageYears: number,
  furnishing: string
): { low: number; high: number; baseRate: number } {
  const cKey = city.toLowerCase().trim();
  const baseRate = CITY_BASE_RATES[cKey] || CITY_BASE_RATES['default'];

  let typeMultiplier = 1.0;
  if (propertyType.toLowerCase().includes('villa')) typeMultiplier = 1.35;
  else if (propertyType.toLowerCase().includes('penthouse')) typeMultiplier = 1.45;
  else if (propertyType.toLowerCase().includes('plot')) typeMultiplier = 0.9;
  else if (propertyType.toLowerCase().includes('commercial')) typeMultiplier = 1.6;

  let ageFactor = 1.0;
  if (ageYears <= 1) ageFactor = 1.1;
  else if (ageYears <= 5) ageFactor = 1.0;
  else if (ageYears <= 10) ageFactor = 0.92;
  else ageFactor = 0.82;

  let furnishFactor = 1.0;
  if (furnishing.toLowerCase().includes('fully')) furnishFactor = 1.12;
  else if (furnishing.toLowerCase().includes('semi')) furnishFactor = 1.05;

  const medianValue = areaSqFt * baseRate * typeMultiplier * ageFactor * furnishFactor;
  const low = Math.round(medianValue * 0.92 / 100000) * 100000;
  const high = Math.round(medianValue * 1.12 / 100000) * 100000;

  return { low, high, baseRate };
}

export async function submitValuationRequest(
  data: Omit<ValuationRequestDocument, 'valuationId' | 'status' | 'createdAt'>
): Promise<ValuationRequestDocument> {
  const colRef = collection(db, VALUATIONS_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const docData: ValuationRequestDocument = {
    ...data,
    valuationId: newDocRef.id,
    status: 'estimated',
    createdAt: now
  };

  await setDoc(newDocRef, docData);
  return docData;
}

export async function fetchAllValuations(): Promise<ValuationRequestDocument[]> {
  try {
    const q = query(collection(db, VALUATIONS_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ValuationRequestDocument);
  } catch {
    return [];
  }
}

/** Flexible valuation request used by HomeValuationPage.
 *  Accepts a partial payload and fills in required fields with defaults. */
export async function requestHomeValuation(
  payload: Partial<ValuationRequestDocument> & { city: string }
): Promise<ValuationRequestDocument> {
  const colRef = collection(db, VALUATIONS_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const docData: ValuationRequestDocument = {
    valuationId: newDocRef.id,
    userId: payload.userId,
    propertyType: payload.propertyType || 'Apartment',
    city: payload.city,
    locality: payload.microMarket || payload.locality || 'Unknown',
    areaSqFt: payload.areaSqFt || 0,
    bhk: payload.bhk || '3BHK',
    ageYears: payload.ageYears || 0,
    furnishing: payload.furnishing || 'Unfurnished',
    estimatedLowPrice: payload.estimatedValueMin || payload.estimatedLowPrice || 0,
    estimatedHighPrice: payload.estimatedValueMax || payload.estimatedHighPrice || 0,
    contactName: payload.userName || payload.contactName || 'Guest',
    contactPhone: payload.userPhone || payload.contactPhone || '',
    contactEmail: payload.userEmail || payload.contactEmail || '',
    // Extended fields
    userName: payload.userName,
    userEmail: payload.userEmail,
    userPhone: payload.userPhone,
    microMarket: payload.microMarket,
    estimatedValueMin: payload.estimatedValueMin,
    estimatedValueMax: payload.estimatedValueMax,
    notes: payload.notes,
    status: 'estimated',
    createdAt: now
  };

  await setDoc(newDocRef, docData);
  return docData;
}

/** Returns market rate range for a city — used by HomeValuationPage */
export function getMarketRateRange(city: string): { minRate: number; maxRate: number } {
  const cKey = city.toLowerCase().trim();
  const CITY_BASE_RATES: Record<string, number> = {
    mumbai: 38000, delhi: 28000, gurugram: 18500, bengaluru: 12500,
    chennai: 11000, hyderabad: 9500, pune: 10500, goa: 14000,
    kochi: 8500, coimbatore: 7200, default: 9000
  };
  const base = CITY_BASE_RATES[cKey] || CITY_BASE_RATES['default'];
  return { minRate: Math.round(base * 0.85), maxRate: Math.round(base * 1.25) };
}
