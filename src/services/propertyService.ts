import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import type { Property } from '../types/property';
import { propertyApi, type PropertySearchParams } from './api/propertyApiService';

const COLLECTION = 'properties';

/**
 * Fetch properties from the PostgreSQL Cloud SQL backend API.
 * Falls back to Firestore/local data if the server is offline or not yet reachable.
 */
export async function fetchProperties(
  params: PropertySearchParams = {},
  fallbackData: Property[] = []
): Promise<{ properties: Property[]; total: number; source: 'sql' | 'firestore' }> {
  try {
    const res = await propertyApi.search(params);
    if (res.properties && res.properties.length > 0) {
      return {
        properties: res.properties,
        total: res.pagination?.total || res.properties.length,
        source: 'sql'
      };
    }
  } catch (err) {
    console.warn('[Property Service] Cloud SQL backend unreachable, falling back to Firestore:', err);
  }

  return {
    properties: fallbackData,
    total: fallbackData.length,
    source: 'firestore'
  };
}

/**
 * Real-time subscription to published properties in Firestore.
 * Updates subscribers immediately when any listing is added or modified.
 */
export function subscribeToProperties(
  callback: (properties: Property[]) => void,
  fallbackData: Property[] = []
): () => void {
  if (!isFirebaseConfigured) {
    callback(fallbackData);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', 'Published')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If no documents exist in Firestore yet, provide the fallback data
          callback(fallbackData);
          return;
        }

        const items: Property[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Property, 'id'>)
          });
        });
        callback(items);
      },
      (error) => {
        console.warn('Realtime Firestore subscription error, using fallback:', error);
        callback(fallbackData);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore onSnapshot listener:', err);
    callback(fallbackData);
    return () => {};
  }
}

/**
 * Create a new property in Cloud Firestore and/or Cloud SQL backend.
 */
export async function createProperty(
  propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites' | 'inquiries'>
): Promise<Property> {
  // Attempt PostgreSQL API creation first
  try {
    const sqlRes = await propertyApi.create(propertyData as any);
    if (sqlRes?.property) {
      return sqlRes.property;
    }
  } catch (e) {
    console.warn('[Property Service] Backend API create failed, falling back to Firestore:', e);
  }

  const newProperty: Omit<Property, 'id'> = {
    ...propertyData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    favorites: 0,
    inquiries: 0
  };

  if (!isFirebaseConfigured) {
    const mockId = 'prop_' + Date.now();
    return { id: mockId, ...newProperty };
  }

  const docRef = await addDoc(collection(db, COLLECTION), newProperty);
  return {
    id: docRef.id,
    ...newProperty
  };
}

/**
 * Seed initial sample properties into Firestore if the database collection is empty.
 */
export async function seedPropertiesIfEmpty(
  sampleProperties: Property[],
  currentUserId: string
): Promise<number> {
  if (!isFirebaseConfigured || !currentUserId) return 0;

  try {
    const existingSnap = await getDocs(collection(db, COLLECTION));
    if (!existingSnap.empty) {
      return 0; // Collection already populated
    }

    let seededCount = 0;
    for (const item of sampleProperties) {
      const { id, ...data } = item;
      const targetDoc = doc(db, COLLECTION, id);
      await setDoc(targetDoc, {
        ...data,
        ownerId: currentUserId,
        status: 'Published',
        updatedAt: new Date().toISOString()
      });
      seededCount++;
    }
    return seededCount;
  } catch (err) {
    console.error('Error seeding initial Firestore properties:', err);
    return 0;
  }
}
