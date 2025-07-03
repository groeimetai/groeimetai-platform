import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Lazy initialization
let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

function getApp(): FirebaseApp {
  if (!app) {
    // Skip initialization during build
    if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
      throw new Error('Firebase cannot be initialized during build')
    }
    
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      throw new Error('Firebase configuration is incomplete')
    }
    
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return app
}

// Getter functions for lazy initialization
function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getApp())
  }
  return authInstance
}

function getDbInstance(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp())
  }
  return dbInstance
}

function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getApp())
  }
  return storageInstance
}

// Export proxies that will initialize on first access
export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    try {
      const instance = getAuthInstance()
      const value = Reflect.get(instance, prop)
      // Bind methods to the instance
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    } catch (error) {
      if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
        // Return a no-op function for methods during build
        return () => {}
      }
      console.warn('Firebase Auth not available:', error)
      // Return a no-op function to prevent crashes
      return () => {}
    }
  }
})

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    try {
      const instance = getDbInstance()
      const value = Reflect.get(instance, prop)
      // Bind methods to the instance
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    } catch (error) {
      if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
        // Return a no-op function for methods during build
        return () => {}
      }
      console.warn('Firestore not available:', error)
      // Return a no-op function to prevent crashes
      return () => {}
    }
  }
})

export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    try {
      const instance = getStorageInstance()
      const value = Reflect.get(instance, prop)
      // Bind methods to the instance
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    } catch (error) {
      if (typeof window === 'undefined' && process.env.BUILDING === 'true') {
        // Return a no-op function for methods during build
        return () => {}
      }
      console.warn('Firebase Storage not available:', error)
      // Return a no-op function to prevent crashes
      return () => {}
    }
  }
})

export default app