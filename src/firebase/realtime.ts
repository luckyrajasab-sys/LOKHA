import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  type Unsubscribe,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import type {
  PropertyDocument,
  InquiryDocument,
  ConversationDocument,
  MessageDocument,
  NotificationDocument,
  UserDocument,
  PropertyType,
  PropertyListingType,
  PropertyStatusType,
  FurnishedStatus
} from '../types/firebaseModels';

export interface PropertyFilterCriteria {
  city?: string;
  propertyType?: PropertyType | 'All';
  listingType?: PropertyListingType | 'All';
  status?: PropertyStatusType | 'All';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnishedStatus?: FurnishedStatus | 'All';
  amenities?: string[];
  isFeatured?: boolean;
}

/**
 * Real-time subscription to published properties with Firestore compound queries and client filtering
 */
export function subscribeToProperties(
  filters: PropertyFilterCriteria,
  callback: (properties: PropertyDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  // Default to available properties for buyers unless explicitly querying status
  if (filters.status && filters.status !== 'All') {
    constraints.push(where('status', '==', filters.status));
  } else if (!filters.status) {
    constraints.push(where('status', '==', 'available'));
  }

  if (filters.listingType && filters.listingType !== 'All') {
    constraints.push(where('listingType', '==', filters.listingType));
  }

  if (filters.propertyType && filters.propertyType !== 'All') {
    constraints.push(where('propertyType', '==', filters.propertyType));
  }

  if (filters.city && filters.city.trim() !== '') {
    constraints.push(where('city', '==', filters.city.trim()));
  }

  if (filters.isFeatured) {
    constraints.push(where('isFeatured', '==', true));
  }

  const q = query(collection(db, 'properties'), ...constraints);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      let properties = snapshot.docs.map((docSnap) => docSnap.data() as PropertyDocument);

      // Client-side fine filtering for range and array constraints (e.g. amenities, price, bedrooms)
      if (filters.minPrice !== undefined) {
        properties = properties.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        properties = properties.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
        properties = properties.filter(p => p.bedrooms >= filters.bedrooms!);
      }
      if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
        properties = properties.filter(p => p.bathrooms >= filters.bathrooms!);
      }
      if (filters.furnishedStatus && filters.furnishedStatus !== 'All') {
        properties = properties.filter(p => p.furnishedStatus === filters.furnishedStatus);
      }
      if (filters.amenities && filters.amenities.length > 0) {
        properties = properties.filter(p =>
          filters.amenities!.every(a => p.amenities?.includes(a))
        );
      }

      callback(properties);
    },
    (error) => {
      console.error('[Realtime Firestore] Error fetching properties:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to a single property's details
 */
export function subscribeToProperty(
  propertyId: string,
  callback: (property: PropertyDocument | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = doc(db, 'properties', propertyId);
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as PropertyDocument);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`[Realtime Firestore] Error watching property ${propertyId}:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time subscription to an owner's or agent's managed properties
 */
export function subscribeToOwnerProperties(
  ownerId: string,
  callback: (properties: PropertyDocument[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'properties'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(d => d.data() as PropertyDocument);
    callback(properties);
  });
}

export function subscribeToAgentProperties(
  agentId: string,
  callback: (properties: PropertyDocument[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'properties'),
    where('agentId', '==', agentId)
  );

  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(d => d.data() as PropertyDocument);
    callback(properties);
  });
}

/**
 * Real-time subscription to a user's favorite property IDs
 */
export function subscribeToUserFavoriteIds(
  uid: string,
  callback: (favoriteIds: string[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'favorites');
  return onSnapshot(colRef, (snapshot) => {
    const ids = snapshot.docs.map(d => d.id);
    callback(ids);
  });
}

/**
 * Real-time subscription to inquiries for a user (as Buyer or Owner/Agent)
 */
export function subscribeToInquiries(
  userId: string,
  isOwnerOrAgent: boolean,
  callback: (inquiries: InquiryDocument[]) => void
): Unsubscribe {
  const fieldToMatch = isOwnerOrAgent ? 'ownerId' : 'buyerId';
  const q = query(
    collection(db, 'inquiries'),
    where(fieldToMatch, '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const inquiries = snapshot.docs.map(d => d.data() as InquiryDocument);
    // Sort descending by creation date
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(inquiries);
  });
}

/**
 * Real-time subscription to user's active conversations
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: ConversationDocument[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const convs = snapshot.docs.map(d => d.data() as ConversationDocument);
    convs.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
    callback(convs);
  });
}

/**
 * Real-time subscription to messages within a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: MessageDocument[]) => void
): Unsubscribe {
  const colRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(200));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({
      messageId: d.id,
      ...(d.data() as Omit<MessageDocument, 'messageId'>)
    }));
    callback(messages);
  });
}

/**
 * Real-time subscription to notifications (users/{uid}/notifications)
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationDocument[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users', userId, 'notifications');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(d => d.data() as NotificationDocument);
    callback(notifications);
  });
}

/**
 * Real-time subscription to all users (Admin Dashboard)
 */
export function subscribeToAllUsers(
  callback: (users: UserDocument[]) => void
): Unsubscribe {
  const q = query(collection(db, 'users'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(d => d.data() as UserDocument);
    callback(users);
  });
}

/**
 * Real-time subscription to all properties (Admin Dashboard)
 */
export function subscribeToAllProperties(
  callback: (properties: PropertyDocument[]) => void
): Unsubscribe {
  const q = query(collection(db, 'properties'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(d => d.data() as PropertyDocument);
    callback(properties);
  });
}
