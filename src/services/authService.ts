import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { initializeAuth } from '@/lib/firebase/auth-init'
import { User } from '@/types'

// Auth instance will be initialized when needed
let authInstance: Auth | null = null;

async function getAuth(): Promise<Auth> {
  if (!authInstance) {
    authInstance = await initializeAuth();
  }
  return authInstance;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, displayName: string): Promise<User> {
    let firebaseUser: FirebaseUser | null = null;
    
    try {
      const auth = await getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName })

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || null,
        role: 'student', // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Try to create the Firestore document
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), user)
      } catch (firestoreError) {
        console.error('Firestore write error:', firestoreError)
        // If Firestore write fails, delete the auth account to maintain consistency
        if (firebaseUser) {
          await firebaseUser.delete()
        }
        throw new Error('Failed to complete registration. Please try again.')
      }

      return user
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // If we created a Firebase Auth account but something else failed,
      // try to clean it up
      if (firebaseUser && error.code !== 'auth/email-already-in-use') {
        try {
          await firebaseUser.delete()
        } catch (deleteError) {
          console.error('Failed to clean up auth account:', deleteError)
        }
      }
      
      throw error
    }
  }

  /**
   * Sign in user
   */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const auth = await getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) {
        throw new Error('User data not found')
      }

      return userDoc.data() as User
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    try {
      const auth = await getAuth();
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const auth = await getAuth();
      const firebaseUser = auth.currentUser
      if (!firebaseUser) return null

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) return null

      return userDoc.data() as User
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      })

      // Update Firebase Auth profile if display name or photo URL changed
      const auth = await getAuth();
      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL,
        })
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  
}