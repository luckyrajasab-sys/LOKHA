import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { SavedSearchDocument, SavedSearchFilters, PropertyDocument } from '../types/firebaseModels';

const LOCAL_STORAGE_KEY = 'lokha_saved_searches';

function getLocalSavedSearches(userId: string): SavedSearchDocument[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setLocalSavedSearches(userId: string, searches: SavedSearchDocument[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(searches));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

export async function saveUserSearch(
  userId: string,
  name: string,
  filters: SavedSearchFilters,
  currentMatchCount: number = 0
): Promise<SavedSearchDocument> {
  const id = `search_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const searchDoc: SavedSearchDocument = {
    id,
    userId,
    name: name || `Saved Search (${new Date().toLocaleDateString()})`,
    createdAt: new Date().toISOString(),
    filters,
    matchCount: currentMatchCount,
    lastCheckedAt: new Date().toISOString(),
    newMatchesAvailable: false
  };

  // Try Firestore
  try {
    const ref = doc(db, 'users', userId, 'savedSearches', id);
    await setDoc(ref, searchDoc);
  } catch (err) {
    console.warn('Firestore savedSearches save fallback to local:', err);
  }

  // Always sync to local storage as well
  const existing = getLocalSavedSearches(userId);
  setLocalSavedSearches(userId, [searchDoc, ...existing]);

  return searchDoc;
}

export async function getUserSavedSearches(userId: string): Promise<SavedSearchDocument[]> {
  try {
    const ref = collection(db, 'users', userId, 'savedSearches');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: SavedSearchDocument[] = [];
      snap.forEach((d) => items.push(d.data() as SavedSearchDocument));
      // Update local cache
      setLocalSavedSearches(userId, items);
      return items;
    }
  } catch (err) {
    console.warn('Firestore savedSearches fetch fallback to local:', err);
  }

  return getLocalSavedSearches(userId);
}

export async function deleteUserSavedSearch(userId: string, searchId: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'savedSearches', searchId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore savedSearches delete fallback to local:', err);
  }

  const existing = getLocalSavedSearches(userId);
  setLocalSavedSearches(userId, existing.filter((s) => s.id !== searchId));
}

/**
 * Filter properties against a saved search definition to surface new matches
 */
export function countMatchesForSearch(
  properties: PropertyDocument[],
  filters: SavedSearchFilters
): number {
  return properties.filter((prop) => {
    // Mode check
    if (filters.mode === 'stays') {
      if (prop.listingType !== 'Stay' && !prop.propertyId.includes('stay') && !prop.title.toLowerCase().includes('stay')) {
        return false;
      }
    } else if (filters.mode === 'projects') {
      if (!prop.builderName && !prop.constructionStatus && !prop.possessionDate) {
        // Still allow if explicitly matched
      }
    }

    // Price range
    if (filters.minPrice !== undefined && prop.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && prop.price > filters.maxPrice) return false;

    // Bedrooms
    if (filters.minBedrooms !== undefined && filters.minBedrooms > 0) {
      const beds = prop.specifications?.bedrooms || prop.bedrooms || 0;
      if (beds < filters.minBedrooms) return false;
    }

    // Property type
    if (filters.propertyType && filters.propertyType.length > 0) {
      if (!filters.propertyType.includes(prop.propertyType)) return false;
    }

    // City / Location
    if (filters.city && filters.city !== 'All') {
      const propCity = prop.location?.city || prop.city || '';
      if (!propCity.toLowerCase().includes(filters.city.toLowerCase())) return false;
    }

    return true;
  }).length;
}
