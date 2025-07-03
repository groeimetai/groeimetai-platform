import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/**
 * Initialize Firebase Auth with proper configuration
 */
export async function initializeAuth(): Promise<Auth> {
  if (authInstance) {
    return authInstance;
  }

  // Skip during build
  if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
    throw new Error('Cannot initialize Firebase Auth during build');
  }

  // Check if we have required config
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    throw new Error('Firebase configuration is incomplete');
  }

  try {
    // Initialize app if needed
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }

    // Get auth instance
    authInstance = getAuth(app);

    // Set persistence to local (stays logged in)
    if (typeof window !== 'undefined') {
      await setPersistence(authInstance, browserLocalPersistence);
    }

    return authInstance;
  } catch (error) {
    console.error('Failed to initialize Firebase Auth:', error);
    throw error;
  }
}

/**
 * Get the initialized auth instance
 */
export function getInitializedAuth(): Auth {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeAuth() first.');
  }
  return authInstance;
}