import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  where
} from 'firebase/firestore';
import { db } from './config';
import type {
  PropertyDocument,
  InquiryDocument,
  InquiryStatus,
  ConversationDocument,
  NotificationDocument,
  PropertyStatusType
} from '../types/firebaseModels';

const PROPERTIES_COL = 'properties';
const INQUIRIES_COL = 'inquiries';
const CONVERSATIONS_COL = 'conversations';
const USERS_COL = 'users';

// ==============================================================================
// 1. PROPERTY OPERATIONS
// ==============================================================================

export async function createProperty(
  data: Omit<PropertyDocument, 'propertyId' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<PropertyDocument> {
  const colRef = collection(db, PROPERTIES_COL);
  const newDocRef = doc(colRef); // Generate unique ID
  const now = new Date().toISOString();

  const property: PropertyDocument = {
    ...data,
    propertyId: newDocRef.id,
    createdAt: now,
    updatedAt: now,
    views: 0
  };

  await setDoc(newDocRef, property);
  return property;
}

export async function updateProperty(
  propertyId: string,
  updates: Partial<Omit<PropertyDocument, 'propertyId' | 'createdAt' | 'ownerId'>>
): Promise<void> {
  const ref = doc(db, PROPERTIES_COL, propertyId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatusType
): Promise<void> {
  const ref = doc(db, PROPERTIES_COL, propertyId);
  await updateDoc(ref, {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const ref = doc(db, PROPERTIES_COL, propertyId);
  await deleteDoc(ref);
}

export async function incrementPropertyViews(propertyId: string): Promise<void> {
  try {
    const ref = doc(db, PROPERTIES_COL, propertyId);
    await updateDoc(ref, {
      views: increment(1)
    });
  } catch (err) {
    // Non-critical, ignore if user lacks permission
  }
}

export async function getPropertyById(propertyId: string): Promise<PropertyDocument | null> {
  const snap = await getDoc(doc(db, PROPERTIES_COL, propertyId));
  if (snap.exists()) {
    return snap.data() as PropertyDocument;
  }
  return null;
}

// ==============================================================================
// 2. FAVORITES OPERATIONS (users/{uid}/favorites/{propertyId})
// ==============================================================================

export async function addFavorite(uid: string, propertyId: string): Promise<void> {
  const ref = doc(db, USERS_COL, uid, 'favorites', propertyId);
  await setDoc(ref, {
    propertyId,
    createdAt: new Date().toISOString()
  });
}

export async function removeFavorite(uid: string, propertyId: string): Promise<void> {
  const ref = doc(db, USERS_COL, uid, 'favorites', propertyId);
  await deleteDoc(ref);
}

export async function checkIsFavorite(uid: string, propertyId: string): Promise<boolean> {
  const ref = doc(db, USERS_COL, uid, 'favorites', propertyId);
  const snap = await getDoc(ref);
  return snap.exists();
}

// ==============================================================================
// 3. INQUIRIES OPERATIONS
// ==============================================================================

export async function createInquiry(
  data: Omit<InquiryDocument, 'inquiryId' | 'createdAt' | 'updatedAt' | 'status'>
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

  // Trigger real-time notification to owner/agent
  const recipientId = data.agentId || data.ownerId;
  if (recipientId) {
    await createNotification(recipientId, {
      type: 'inquiry',
      title: 'New Property Inquiry',
      message: `${data.buyerName || 'A buyer'} inquired about "${data.propertyTitle || 'your listing'}".`,
      relatedPropertyId: data.propertyId,
      relatedInquiryId: newDocRef.id
    });
  }

  return inquiry;
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void> {
  const ref = doc(db, INQUIRIES_COL, inquiryId);
  await updateDoc(ref, {
    status,
    updatedAt: new Date().toISOString()
  });
}

// ==============================================================================
// 4. CONVERSATIONS & REAL-TIME MESSAGING
// ==============================================================================

export async function getOrCreateConversation(
  buyerId: string,
  ownerId: string,
  propertyId: string,
  propertyTitle = 'Property'
): Promise<string> {
  // Check if conversation already exists for these participants & property
  const q = query(
    collection(db, CONVERSATIONS_COL),
    where('participants', 'array-contains', buyerId)
  );
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const c = docSnap.data() as ConversationDocument;
    if (c.propertyId === propertyId && c.participants.includes(ownerId)) {
      return docSnap.id;
    }
  }

  // Create new conversation
  const newConvRef = doc(collection(db, CONVERSATIONS_COL));
  const now = new Date().toISOString();
  const conv: ConversationDocument = {
    conversationId: newConvRef.id,
    participants: [buyerId, ownerId],
    propertyId,
    propertyTitle,
    lastMessage: 'Conversation started',
    lastMessageAt: now,
    createdAt: now
  };
  await setDoc(newConvRef, conv);
  return newConvRef.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  messageText: string
): Promise<void> {
  const messagesCol = collection(db, CONVERSATIONS_COL, conversationId, 'messages');
  const now = new Date().toISOString();

  await addDoc(messagesCol, {
    senderId,
    receiverId,
    message: messageText.trim(),
    createdAt: now,
    read: false
  });

  // Update conversation lastMessage
  const convRef = doc(db, CONVERSATIONS_COL, conversationId);
  await updateDoc(convRef, {
    lastMessage: messageText.trim(),
    lastMessageAt: now
  });

  // Notify receiver
  await createNotification(receiverId, {
    type: 'message',
    title: 'New Message',
    message: messageText.length > 50 ? `${messageText.slice(0, 50)}...` : messageText
  });
}

// ==============================================================================
// 5. NOTIFICATIONS OPERATIONS (users/{uid}/notifications/{id})
// ==============================================================================

export async function createNotification(
  userId: string,
  notification: Omit<NotificationDocument, 'notificationId' | 'createdAt' | 'isRead'>
): Promise<void> {
  try {
    const colRef = collection(db, USERS_COL, userId, 'notifications');
    const newDocRef = doc(colRef);
    await setDoc(newDocRef, {
      ...notification,
      notificationId: newDocRef.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Notification Error] Could not create notification:', err);
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const ref = doc(db, USERS_COL, userId, 'notifications', notificationId);
  await updateDoc(ref, { isRead: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const colRef = collection(db, USERS_COL, userId, 'notifications');
  const q = query(colRef, where('isRead', '==', false));
  const snap = await getDocs(q);
  const promises = snap.docs.map(d => updateDoc(d.ref, { isRead: true }));
  await Promise.all(promises);
}
