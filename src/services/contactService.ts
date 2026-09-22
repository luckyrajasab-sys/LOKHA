import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ContactMessageDocument } from '../types/firebaseModels';

const CONTACT_COL = 'contactMessages';

export async function submitContactMessage(
  data: Omit<ContactMessageDocument, 'messageId' | 'status' | 'createdAt'>
): Promise<ContactMessageDocument> {
  const colRef = collection(db, CONTACT_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const msg: ContactMessageDocument = {
    ...data,
    messageId: newDocRef.id,
    status: 'new',
    createdAt: now
  };

  await setDoc(newDocRef, msg);
  return msg;
}

export async function fetchAllContactMessages(): Promise<ContactMessageDocument[]> {
  try {
    const q = query(collection(db, CONTACT_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ContactMessageDocument);
  } catch {
    return [];
  }
}
