/**
 * Centralized Firebase database getter
 * This ensures Firebase is properly initialized before use
 */
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Auth } from 'firebase/auth';
import { getFirebaseDb, getFirebaseStorage, getFirebaseAuth } from '../firebase-direct';

/**
 * Get Firestore instance with lazy initialization
 */
export function getDb(): Firestore {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    console.warn('Attempting to access Firestore on server');
    throw new Error('Firestore cannot be accessed during server-side rendering');
  }
  
  try {
    return getFirebaseDb();
  } catch (error) {
    console.error('Failed to get Firestore instance:', error);
    throw error;
  }
}

/**
 * Get Storage instance with lazy initialization
 */
export function getStorage(): FirebaseStorage {
  try {
    return getFirebaseStorage();
  } catch (error) {
    console.error('Failed to get Storage instance:', error);
    throw new Error('Firebase Storage not available. Please check your configuration.');
  }
}

/**
 * Get Auth instance with lazy initialization
 */
export function getAuth(): Auth {
  try {
    return getFirebaseAuth();
  } catch (error) {
    console.error('Failed to get Auth instance:', error);
    throw new Error('Firebase Auth not available. Please check your configuration.');
  }
}