import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { SiteVisitDocument, SiteVisitStatus } from '../types/firebaseModels';

const SITE_VISITS_COL = 'siteVisits';
const USERS_COL = 'users';

export async function requestSiteVisit(
  data: Omit<SiteVisitDocument, 'visitId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<SiteVisitDocument> {
  const colRef = collection(db, SITE_VISITS_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const visitDoc: SiteVisitDocument = {
    ...data,
    visitId: newDocRef.id,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(newDocRef, visitDoc);

  // Notify property owner
  if (data.ownerId) {
    try {
      const notifRef = doc(collection(db, USERS_COL, data.ownerId, 'notifications'));
      await setDoc(notifRef, {
        notificationId: notifRef.id,
        type: 'site_visit',
        title: 'New Site Visit Requested',
        message: `${data.buyerName} requested a visit for "${data.propertyTitle || 'your property'}" on ${data.preferredDate} at ${data.preferredTime}.`,
        relatedPropertyId: data.propertyId,
        relatedVisitId: newDocRef.id,
        isRead: false,
        createdAt: now
      });
    } catch (e) {
      console.warn('Could not write owner notification for site visit:', e);
    }
  }

  return visitDoc;
}

export async function updateSiteVisitStatus(
  visitId: string,
  status: SiteVisitStatus,
  buyerId?: string,
  propertyTitle?: string
): Promise<void> {
  const visitRef = doc(db, SITE_VISITS_COL, visitId);
  const now = new Date().toISOString();

  await updateDoc(visitRef, {
    status,
    updatedAt: now
  });

  // Notify buyer of confirmation/cancellation
  if (buyerId) {
    try {
      const notifRef = doc(collection(db, USERS_COL, buyerId, 'notifications'));
      await setDoc(notifRef, {
        notificationId: notifRef.id,
        type: 'site_visit',
        title: `Site Visit ${status.toUpperCase()}`,
        message: `Your site visit request for "${propertyTitle || 'Property'}" has been ${status}.`,
        relatedVisitId: visitId,
        isRead: false,
        createdAt: now
      });
    } catch (e) {
      console.warn('Could not write buyer notification for site visit update:', e);
    }
  }
}

export function subscribeToBuyerSiteVisits(
  buyerId: string,
  callback: (visits: SiteVisitDocument[]) => void
): () => void {
  const q = query(
    collection(db, SITE_VISITS_COL),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const visits: SiteVisitDocument[] = [];
      snap.forEach((d) => visits.push(d.data() as SiteVisitDocument));
      callback(visits);
    },
    (err) => {
      console.warn('Site visit subscription error:', err);
      callback([]);
    }
  );
}

export function subscribeToOwnerSiteVisits(
  ownerId: string,
  callback: (visits: SiteVisitDocument[]) => void
): () => void {
  const q = query(
    collection(db, SITE_VISITS_COL),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const visits: SiteVisitDocument[] = [];
      snap.forEach((d) => visits.push(d.data() as SiteVisitDocument));
      callback(visits);
    },
    (err) => {
      console.warn('Owner site visit subscription error:', err);
      callback([]);
    }
  );
}

export async function fetchAllSiteVisits(): Promise<SiteVisitDocument[]> {
  try {
    const q = query(collection(db, SITE_VISITS_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SiteVisitDocument);
  } catch {
    return [];
  }
}

/** Alias used by PropertyDetailsPage */
export const bookSiteVisit = requestSiteVisit;
