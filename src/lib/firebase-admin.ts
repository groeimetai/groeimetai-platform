import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let app: App | undefined;
let adminAuth: Auth | any;
let adminDb: Firestore | any;

function initializeFirebaseAdmin() {
  try {
    // Check if app already exists
    if (getApps().length > 0) {
      app = getApp();
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
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
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Initialize on first import
initializeFirebaseAdmin();

// Export initialized services
export { adminAuth, adminDb };
export default app;