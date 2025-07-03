import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
        get() {
          throw new Error('Firebase Auth not available during build');
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
        get() {
          throw new Error('Firestore not available during build');
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
        get() {
          throw new Error('Firebase Storage not available during build');
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