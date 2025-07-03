import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let app: App | undefined;
let adminAuth: Auth | any;
let adminDb: Firestore | any;
let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized) {
    return;
  }

  try {
    // Check if app already exists
    if (getApps().length > 0) {
      app = getApp();
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
      initialized = true;
      return;
    }

    // Debug: Log which env vars are missing
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log('Firebase Admin SDK Environment Check:');
    console.log('- FIREBASE_PROJECT_ID:', projectId ? 'Set' : 'Missing');
    console.log('- FIREBASE_CLIENT_EMAIL:', clientEmail ? 'Set' : 'Missing');
    console.log('- FIREBASE_PRIVATE_KEY:', privateKey ? 'Set (length: ' + privateKey.length + ')' : 'Missing');

    if (!projectId || !clientEmail || !privateKey) {
      // During build time, skip initialization
      if (process.env.BUILDING === 'true' || (process.env.NODE_ENV === 'production' && !global.window)) {
        console.log('⚠️  Skipping Firebase Admin SDK initialization during build');
        return;
      }

      // In development, return mock services to prevent crashes
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Firebase Admin SDK not configured. Using mock services.');
        console.warn('⚠️  To fix this, add the following to your .env.local file:');
        console.warn('   FIREBASE_PROJECT_ID=your-project-id');
        console.warn('   FIREBASE_CLIENT_EMAIL=your-service-account-email');
        console.warn('   FIREBASE_PRIVATE_KEY="your-private-key"');
        
        // Return mock services
        adminAuth = {
          verifyIdToken: async () => ({ uid: 'mock-user-id' }),
        } as any;
        
        adminDb = {
          collection: () => ({
            doc: () => ({
              get: async () => ({ exists: false, data: () => null }),
              set: async () => {},
              update: async () => {},
            }),
            where: () => ({
              limit: () => ({
                get: async () => ({ empty: true, docs: [] }),
              }),
              get: async () => ({ empty: true, docs: [] }),
            }),
          }),
        } as any;
        
        initialized = true;
        return;
      }
      
      throw new Error('Missing Firebase Admin SDK environment variables. Check your .env.local file.');
    }

    // Initialize with service account
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    initialized = true;
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Lazy getters that initialize on first access
export function getAdminAuth(): Auth {
  if (!initialized) {
    initializeFirebaseAdmin();
  }
  
  if (!adminAuth) {
    throw new Error('Firebase Admin Auth not initialized');
  }
  
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!initialized) {
    initializeFirebaseAdmin();
  }
  
  if (!adminDb) {
    throw new Error('Firebase Admin Firestore not initialized');
  }
  
  return adminDb;
}

// Export for backward compatibility but mark as deprecated
export { adminAuth, adminDb };
export default app;