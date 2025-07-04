import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { firebaseConfig } from './client-config';

// Lazy initialization
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let analyticsInstance: Analytics | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    // Only initialize if we're not in build mode and have config
    if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
      throw new Error('Firebase cannot be initialized during build');
    }
    
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      throw new Error('Firebase configuration is incomplete');
    }
    
    app = initializeApp(firebaseConfig);
  }
  return app;
}

// Initialize Firebase services lazily
export const auth = (() => {
  if (!authInstance) {
    try {
      authInstance = getAuth(getApp());
    } catch (error) {
      // Return a proxy that will throw when accessed
      return new Proxy({} as Auth, {
        get(target, prop) {
          if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
            // Return no-op for server/build
            return () => {};
          }
          throw new Error('Firebase Auth not available');
        }
      });
    }
  }
  return authInstance;
})();

export const db = (() => {
  if (!dbInstance) {
    try {
      dbInstance = getFirestore(getApp());
    } catch (error) {
      // Return a proxy that will throw when accessed
      return new Proxy({} as Firestore, {
        get(target, prop) {
          if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
            // Return no-op for server/build
            return () => {};
          }
          throw new Error('Firestore not available');
        }
      });
    }
  }
  return dbInstance;
})();

export const storage = (() => {
  if (!storageInstance) {
    try {
      storageInstance = getStorage(getApp());
    } catch (error) {
      // Return a proxy that will throw when accessed
      return new Proxy({} as FirebaseStorage, {
        get(target, prop) {
          if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
            // Return no-op for server/build
            return () => {};
          }
          throw new Error('Firebase Storage not available');
        }
      });
    }
  }
  return storageInstance;
})();

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? (() => {
  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(getApp());
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }
  return analyticsInstance;
})() : null;

export default app;