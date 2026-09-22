import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { PropertyDocument } from '../types/firebaseModels';

const USERS_COL = 'users';
const PROPERTIES_COL = 'properties';

export async function addFavorite(userId: string, propertyId: string): Promise<void> {
  const ref = doc(db, USERS_COL, userId, 'favorites', propertyId);
  await setDoc(ref, {
    propertyId,
    createdAt: new Date().toISOString()
  });
}

export async function removeFavorite(userId: string, propertyId: string): Promise<void> {
  const ref = doc(db, USERS_COL, userId, 'favorites', propertyId);
  await deleteDoc(ref);
}

export async function isPropertyFavorited(userId: string, propertyId: string): Promise<boolean> {
  try {
    const ref = doc(db, USERS_COL, userId, 'favorites', propertyId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeToUserFavoriteIds(
  userId: string,
  callback: (ids: string[]) => void
): () => void {
  const ref = collection(db, USERS_COL, userId, 'favorites');
  return onSnapshot(
    ref,
    (snap) => {
      const ids: string[] = [];
      snap.forEach((d) => ids.push(d.id));
      callback(ids);
    },
    (err) => {
      console.warn('Favorite subscription error:', err);
      callback([]);
    }
  );
}

export async function fetchUserFavoriteProperties(userId: string): Promise<PropertyDocument[]> {
  try {
    const favRef = collection(db, USERS_COL, userId, 'favorites');
    const favSnap = await getDocs(favRef);
    const ids = favSnap.docs.map(d => d.id);

    if (ids.length === 0) return [];

    const properties: PropertyDocument[] = [];
    for (const id of ids) {
      const pRef = doc(db, PROPERTIES_COL, id);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        properties.push(pSnap.data() as PropertyDocument);
      }
    }
    return properties;
  } catch (err) {
    console.warn('Could not fetch favorite properties:', err);
    return [];
  }
}
/** Toggle a property as favorite/unfavorite.
 *  Accepts (userId, property: PropertyDocument) or (userId, propertyId: string, isFav: boolean).
 *  Returns true if the property is now saved, false if removed. */
export async function toggleFavorite(
  userId: string,
  propertyOrId: PropertyDocument | string,
  isFav?: boolean
): Promise<boolean> {
  const propertyId = typeof propertyOrId === 'string' ? propertyOrId : propertyOrId.propertyId;
  let currentlyFav: boolean;
  if (isFav !== undefined) {
    currentlyFav = isFav;
  } else {
    currentlyFav = await isPropertyFavorited(userId, propertyId);
  }
  if (currentlyFav) {
    await removeFavorite(userId, propertyId);
    return false;
  } else {
    await addFavorite(userId, propertyId);
    return true;
  }
}

/** Subscribe to full favorite property objects — alias for subscribeToUserFavoriteIds-based flow */
export function subscribeToFavorites(
  userId: string,
  callback: (properties: PropertyDocument[]) => void
): () => void {
  const ref = collection(db, USERS_COL, userId, 'favorites');
  return onSnapshot(
    ref,
    async (snap) => {
      const ids = snap.docs.map(d => d.id);
      if (ids.length === 0) { callback([]); return; }
      const properties: PropertyDocument[] = [];
      for (const id of ids) {
        const pRef = doc(db, PROPERTIES_COL, id);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) properties.push(pSnap.data() as PropertyDocument);
      }
      callback(properties);
    },
    (err) => {
      console.warn('subscribeToFavorites error:', err);
      callback([]);
    }
  );
}

/** Alias for isPropertyFavorited — used by BuyPage and PropertyDetailsPage */
export const isPropertySaved = isPropertyFavorited;
