import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a property image to Firebase Storage under property-images/{propertyId}/{timestamp}_{filename}
 * Returns the public download URL.
 */
export async function uploadPropertyImage(propertyId: string, file: File): Promise<string> {
  // Sanitize filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `property-images/${propertyId}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  // Set metadata
  const metadata = {
    contentType: file.type,
    customMetadata: {
      propertyId,
      originalName: file.name
    }
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Upload multiple property images in parallel and return the download URLs
 */
export async function uploadMultiplePropertyImages(propertyId: string, files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadPropertyImage(propertyId, file));
  return Promise.all(uploadPromises);
}

/**
 * Upload user profile picture to user-avatars/{uid}/{timestamp}_{filename}
 */
export async function uploadUserAvatar(uid: string, file: File): Promise<string> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `user-avatars/${uid}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}
