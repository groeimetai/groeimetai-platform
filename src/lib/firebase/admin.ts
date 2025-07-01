import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

// Check if we have the required environment variables
const hasFirebaseConfig = 
  process.env.FIREBASE_ADMIN_PROJECT_ID && 
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL && 
  process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// Only initialize if we have config (skip during build)
if (hasFirebaseConfig && typeof window === 'undefined') {
  try {
    const adminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    };

    // Initialize Firebase Admin
    app = getApps().length > 0 ? getApps()[0] : initializeApp(adminConfig);
    
    // Initialize Admin services
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export with null checks
export { adminAuth, adminDb };
export default app;