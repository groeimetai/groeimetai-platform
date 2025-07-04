import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase/client-config';

// Direct initialization without proxies
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase app if not already initialized
 */
function initializeFirebase(): FirebaseApp {
  if (!app) {
    // Skip initialization during build
    if (process.env.BUILDING === 'true') {
      console.warn('Firebase initialization skipped during build');
      throw new Error('Firebase cannot be initialized during build');
    }
    
    // Check if running in browser
    if (typeof window === 'undefined') {
      console.warn('Firebase initialization skipped on server');
      throw new Error('Firebase cannot be initialized on server');
    }
    
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      console.log('Firebase app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }
  return app;
}

/**
 * Get Auth instance
 */
export function getFirebaseAuth(): Auth {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    throw new Error('Auth cannot be accessed on server');
  }
  
  if (!auth) {
    const firebaseApp = initializeFirebase();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

/**
 * Get Firestore instance
 */
export function getFirebaseDb(): Firestore {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    throw new Error('Firestore cannot be accessed on server');
  }
  
  if (!db) {
    const firebaseApp = initializeFirebase();
    db = getFirestore(firebaseApp);
  }
  return db;
}

/**
 * Get Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    throw new Error('Storage cannot be accessed on server');
  }
  
  if (!storage) {
    const firebaseApp = initializeFirebase();
    storage = getStorage(firebaseApp);
  }
  return storage;
}

// Export direct references for compatibility
export { auth, db, storage };