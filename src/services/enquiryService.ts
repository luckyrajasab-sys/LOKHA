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
