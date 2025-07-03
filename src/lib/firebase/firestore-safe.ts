import { 
  collection as firestoreCollection,
  doc as firestoreDoc,
  CollectionReference,
  DocumentReference,
  Firestore
} from 'firebase/firestore';
import { db } from './config';

/**
 * Safe wrapper for Firestore collection() that handles initialization errors
 */
export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference {
  try {
    // Check if firestore is properly initialized
    if (!firestore || typeof firestore !== 'object') {
      console.warn('Firestore not properly initialized');
      throw new Error('Firestore not available');
    }
    return firestoreCollection(firestore, path, ...pathSegments);
  } catch (error) {
    console.error('Error accessing Firestore collection:', error);
    throw error;
  }
}

/**
 * Safe wrapper for Firestore doc() that handles initialization errors
 */
export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference {
  try {
    // Check if firestore is properly initialized
    if (!firestore || typeof firestore !== 'object') {
      console.warn('Firestore not properly initialized');
      throw new Error('Firestore not available');
    }
    return firestoreDoc(firestore, path, ...pathSegments);
  } catch (error) {
    console.error('Error accessing Firestore document:', error);
    throw error;
  }
}

// Re-export other Firestore functions
export * from 'firebase/firestore';