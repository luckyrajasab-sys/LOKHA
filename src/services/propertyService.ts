import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { PropertyDocument, PropertyStatusType } from '../types/firebaseModels';

const PROPERTIES_COL = 'properties';

export async function fetchPropertyDocumentById(propertyId: string): Promise<PropertyDocument | null> {
  try {
    const ref = doc(db, PROPERTIES_COL, propertyId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as PropertyDocument;
    }
  } catch (err) {
    console.warn('Could not fetch property by ID:', err);
  }
  return null;
}

export async function incrementPropertyDocumentViews(propertyId: string): Promise<void> {
  try {
    // Avoid rapid duplicate view incrementing
    const lastViewKey = `lokha_view_${propertyId}`;
    const lastViewed = sessionStorage.getItem(lastViewKey);
    const now = Date.now();
    if (lastViewed && now - parseInt(lastViewed, 10) < 60000) {
      return; // Debounce view increments within 1 minute
    }
    sessionStorage.setItem(lastViewKey, now.toString());

    const ref = doc(db, PROPERTIES_COL, propertyId);
    await updateDoc(ref, {
      views: increment(1)
    });
  } catch (e) {
    console.warn('Could not increment views:', e);
  }
}

export async function createPropertyDocument(
  data: Omit<PropertyDocument, 'propertyId' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<PropertyDocument> {
  const colRef = collection(db, PROPERTIES_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const property: PropertyDocument = {
    ...data,
    propertyId: newDocRef.id,
    verificationStatus: 'pending', // Starts as pending for admin verification
    status: 'available',
    createdAt: now,
    updatedAt: now,
    views: 0
  };

  await setDoc(newDocRef, property);
  return property;
}

export async function updatePropertyDocument(
  propertyId: string,
  updates: Partial<Omit<PropertyDocument, 'propertyId' | 'createdAt' | 'ownerId'>>
): Promise<void> {
  const ref = doc(db, PROPERTIES_COL, propertyId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function setPropertyDocumentStatus(
  propertyId: string,
  status: PropertyStatusType
): Promise<void> {
  const ref = doc(db, PROPERTIES_COL, propertyId);
  await updateDoc(ref, {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function fetchSimilarProperties(property: PropertyDocument, limitCount: number = 3): Promise<PropertyDocument[]> {
  try {
    const q = query(
      collection(db, PROPERTIES_COL),
      where('city', '==', property.city),
      where('propertyType', '==', property.propertyType),
      limit(limitCount + 2)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => d.data() as PropertyDocument)
      .filter(p => p.propertyId !== property.propertyId)
      .slice(0, limitCount);
  } catch {
    return [];
  }
}

export async function fetchAllVerifiedProperties(): Promise<PropertyDocument[]> {
  try {
    const q = query(
      collection(db, PROPERTIES_COL),
      where('status', '==', 'available')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PropertyDocument);
  } catch {
    return [];
  }
}

/** Alias for fetchAllVerifiedProperties — used by newer pages */
export const getProperties = async (filters?: {
  listingType?: string;
  city?: string;
  propertyType?: string;
  verifiedOnly?: boolean;
}): Promise<PropertyDocument[]> => {
  const all = await fetchAllVerifiedProperties();
  if (!filters) return all;
  return all.filter(p => {
    if (filters.listingType && p.listingType !== filters.listingType) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
    if (filters.verifiedOnly && p.verificationStatus !== 'verified') return false;
    return true;
  });
};

/** Alias for fetchPropertyDocumentById — used by PropertyDetailsPage */
export const getPropertyById = fetchPropertyDocumentById;

/** Alias for incrementPropertyDocumentViews — used by PropertyDetailsPage */
export const incrementPropertyViews = incrementPropertyDocumentViews;

/** Alias for fetchSimilarProperties — used by PropertyDetailsPage */
export const getSimilarProperties = fetchSimilarProperties;
