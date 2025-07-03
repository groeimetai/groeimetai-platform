'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import { initializeAuth } from '@/lib/firebase/auth-init';
import { getUserProfile, createUserProfile, UserProfile } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      try {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          profile = await createUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'student',
            subscriptionStatus: 'free',
            enrolledCourses: [],
            completedLessons: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const signOut = async () => {
    try {
      const auth = await initializeAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getIdToken = async (): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.getIdToken();
  };

  useEffect(() => {
    // Skip auth initialization during build or when auth is not available
    if (typeof window === 'undefined' || process.env.BUILDING === 'true') {
      setLoading(false);
      return;
    }
    
    let unsubscribe: (() => void) | undefined;
    
    const setupAuth = async () => {
      try {
        const auth = await initializeAuth();
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.warn('Auth initialization skipped:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    refreshUserProfile();
  }, [user, refreshUserProfile]);

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    refreshUserProfile,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}