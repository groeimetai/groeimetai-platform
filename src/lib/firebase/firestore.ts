import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'instructor' | 'student';
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  enrolledCourses: string[];
  completedLessons: string[];
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    planId: string;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: Date;
    mollieCustomerId?: string;
  };
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  price: number;
  currency: 'EUR';
  thumbnailUrl: string;
  videoUrl?: string;
  lessons: Lesson[];
  prerequisites: string[];
  learningObjectives: string[];
  isPublished: boolean;
  enrollmentCount: number;
  rating: number;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  resources: Resource[];
  quiz?: Quiz;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'image';
  url: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Progress Tracking
export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  certificates: Certificate[];
}

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: Date;
  certificateUrl: string;
}

// User Profile Functions
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: Date; updatedAt: Date }): Promise<UserProfile> {
  try {
    const docRef = doc(db, 'users', profile.uid);
    const profileData = {
      ...profile,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
    };
    
    await setDoc(docRef, profileData);
    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Course Functions
export async function getCourses(published: boolean = true): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'courses');
    const q = published 
      ? query(coursesRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'))
      : query(coursesRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      courses.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Course);
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
}

export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
}

// Progress Functions
export async function getUserProgress(userId: string, courseId: string): Promise<Progress | null> {
  try {
    const progressRef = collection(db, 'progress');
    const q = query(
      progressRef, 
      where('userId', '==', userId), 
      where('courseId', '==', courseId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastAccessed: data.lastAccessed?.toDate(),
      } as Progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

export async function updateUserProgress(progressData: Omit<Progress, 'id'>): Promise<string> {
  try {
    const progressRef = collection(db, 'progress');
    const progressDoc = {
      ...progressData,
      lastAccessed: Timestamp.now(),
    };
    
    // Check if progress already exists
    const existingProgress = await getUserProgress(progressData.userId, progressData.courseId);
    
    if (existingProgress) {
      const docRef = doc(db, 'progress', existingProgress.id);
      await updateDoc(docRef, progressDoc);
      return existingProgress.id;
    } else {
      const docRef = await addDoc(progressRef, progressDoc);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}