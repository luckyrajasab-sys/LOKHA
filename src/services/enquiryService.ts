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
import type { InquiryDocument, InquiryStatus } from '../types/firebaseModels';

const INQUIRIES_COL = 'inquiries';
const USERS_COL = 'users';

export async function createEnquiry(
  data: Omit<InquiryDocument, 'inquiryId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<InquiryDocument> {
  const colRef = collection(db, INQUIRIES_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const inquiry: InquiryDocument = {
    ...data,
    inquiryId: newDocRef.id,
    status: 'new',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(newDocRef, inquiry);

  // Send notification to Owner / Agent
  const targetRecipientId = data.agentId || data.ownerId;
  if (targetRecipientId) {
    try {
      const notifRef = doc(collection(db, USERS_COL, targetRecipientId, 'notifications'));
      await setDoc(notifRef, {
        notificationId: notifRef.id,
        type: 'inquiry',
        title: 'New Property Inquiry Received',
        message: `${data.buyerName || 'A verified client'} inquired on "${data.propertyTitle || 'your listing'}": "${data.message.slice(0, 60)}..."`,
        relatedPropertyId: data.propertyId,
        relatedInquiryId: newDocRef.id,
        isRead: false,
        createdAt: now
      });
    } catch (e) {
      console.warn('Could not write notification for enquiry:', e);
    }
  }

  // Confirmation notification for buyer
  if (data.buyerId) {
    try {
      const notifRef = doc(collection(db, USERS_COL, data.buyerId, 'notifications'));
      await setDoc(notifRef, {
        notificationId: notifRef.id,
        type: 'inquiry',
        title: 'Inquiry Sent Successfully',
        message: `Your inquiry for "${data.propertyTitle || 'Property'}" has been forwarded to the verified owner.`,
        relatedPropertyId: data.propertyId,
        isRead: false,
        createdAt: now
      });
    } catch (e) {
      console.warn('Could not write buyer confirmation notification:', e);
    }
  }

  return inquiry;
}

export async function updateEnquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  const ref = doc(db, INQUIRIES_COL, inquiryId);
  await updateDoc(ref, {
    status,
    updatedAt: new Date().toISOString()
  });
}

export function subscribeToUserInquiries(
  userId: string,
  isSellerSide: boolean,
  callback: (inquiries: InquiryDocument[]) => void
): () => void {
  const fieldToMatch = isSellerSide ? 'ownerId' : 'buyerId';
  const q = query(
    collection(db, INQUIRIES_COL),
    where(fieldToMatch, '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const list: InquiryDocument[] = [];
      snap.forEach((d) => list.push(d.data() as InquiryDocument));
      callback(list);
    },
    (err) => {
      console.warn('Inquiry subscription error:', err);
      callback([]);
    }
  );
}

export async function fetchAllInquiries(): Promise<InquiryDocument[]> {
  try {
    const q = query(collection(db, INQUIRIES_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as InquiryDocument);
  } catch {
    return [];
  }
}

/**
 * Creates a comprehensive multi-step institutional or buyer requirement inquiry.
 * Saves to Firestore 'inquiries' collection and dispatches admin notifications.
 */
export async function createDetailedEnquiry(
  payload: Omit<InquiryDocument, 'inquiryId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<InquiryDocument> {
  const colRef = collection(db, INQUIRIES_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const inquiry: InquiryDocument = {
    ...payload,
    inquiryId: newDocRef.id,
    propertyId: payload.propertyId || 'custom-enquiry',
    ownerId: payload.ownerId || 'admin',
    status: 'new',
    createdAt: now,
    updatedAt: now
  };

  await setDoc(newDocRef, inquiry);

  // Send admin notification
  try {
    const adminNotifRef = doc(collection(db, USERS_COL, 'admin', 'notifications'));
    await setDoc(adminNotifRef, {
      notificationId: adminNotifRef.id,
      type: 'detailed_enquiry',
      title: `New ${payload.intent?.toUpperCase() || 'CUSTOM'} Requirement Submitted`,
      message: `${payload.buyerName || 'Client'} submitted a request for ${payload.propertyType || 'properties'} in ${payload.locationDetails?.city || 'India'}.`,
      relatedInquiryId: newDocRef.id,
      isRead: false,
      createdAt: now
    });
  } catch (err) {
    console.warn('Could not post admin notification for detailed enquiry:', err);
  }

  return inquiry;
}

