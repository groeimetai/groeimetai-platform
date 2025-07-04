import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp,
  Timestamp,
  Firestore
} from 'firebase/firestore'

import { getDb } from '@/lib/firebase/db-getter';

export interface InstructorApplication {
  userId: string
  email: string
  name: string
  expertise: string
  experience: string
  courseIdeas: string
  bio: string
  linkedIn?: string
  website?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
  reviewNotes?: string
}

export interface Instructor {
  id: string
  userId: string
  email: string
  name: string
  bio: string
  avatar?: string
  expertise: string[]
  linkedIn?: string
  website?: string
  revenueSharePercentage: number
  status: 'active' | 'inactive'
  totalEarnings: number
  totalStudents: number
  totalCourses: number
  rating: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const instructorService = {
  /**
   * Submit instructor application
   */
  async createInstructorApplication(data: Omit<InstructorApplication, 'status' | 'submittedAt'>) {
    try {
      const db = getDb();
      const applicationRef = doc(collection(db, 'instructor-applications'))
      await setDoc(applicationRef, {
        ...data,
        status: 'pending',
        submittedAt: serverTimestamp()
      })
      return applicationRef.id
    } catch (error) {
      console.error('Error creating instructor application:', error)
      throw error
    }
  },

  /**
   * Get instructor application by user ID
   */
  async getApplicationByUserId(userId: string) {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'instructor-applications'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) return null
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as InstructorApplication & { id: string }
    } catch (error) {
      console.error('Error getting instructor application:', error)
      throw error
    }
  },

  /**
   * Check if user is an approved instructor
   */
  async isApprovedInstructor(userId: string) {
    try {
      const db = getDb();
      const instructorDoc = await getDoc(doc(db, 'instructors', userId))
      if (!instructorDoc.exists()) return false
      
      const instructor = instructorDoc.data() as Instructor
      return instructor.status === 'active'
    } catch (error) {
      console.error('Error checking instructor status:', error)
      return false
    }
  },

  /**
   * Get instructor profile
   */
  async getInstructorProfile(userId: string) {
    try {
      const db = getDb();
      const instructorDoc = await getDoc(doc(db, 'instructors', userId))
      if (!instructorDoc.exists()) return null
      
      return {
        id: instructorDoc.id,
        ...instructorDoc.data()
      } as Instructor
    } catch (error) {
      console.error('Error getting instructor profile:', error)
      throw error
    }
  },

  /**
   * Update instructor profile
   */
  async updateInstructorProfile(userId: string, updates: Partial<Instructor>) {
    try {
      const db = getDb();
      const instructorRef = doc(db, 'instructors', userId)
      await updateDoc(instructorRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating instructor profile:', error)
      throw error
    }
  },

  /**
   * Get all active instructors
   */
  async getActiveInstructors() {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'instructors'),
        where('status', '==', 'active'),
        orderBy('rating', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Instructor[]
    } catch (error) {
      console.error('Error getting active instructors:', error)
      throw error
    }
  },

  /**
   * Get instructor statistics
   */
  async getInstructorStats(userId: string) {
    try {
      const db = getDb();
      // Get courses by instructor
      const coursesQuery = query(
        collection(db, 'courses'),
        where('instructorId', '==', userId)
      )
      const coursesSnapshot = await getDocs(coursesQuery)
      const courseIds = coursesSnapshot.docs.map(doc => doc.id)
      
      // Get enrollments for instructor's courses
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', 'in', courseIds.slice(0, 10)) // Firestore limit
      )
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
      
      // Calculate stats
      const totalCourses = coursesSnapshot.size
      const totalStudents = enrollmentsSnapshot.size
      const totalRevenue = enrollmentsSnapshot.docs.reduce((sum, doc) => {
        const enrollment = doc.data()
        return sum + (enrollment.price || 0)
      }, 0)
      
      return {
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating: 4.8 // Placeholder - implement actual rating calculation
      }
    } catch (error) {
      console.error('Error getting instructor stats:', error)
      throw error
    }
  }
}

// Export convenience functions
export const {
  createInstructorApplication,
  getApplicationByUserId,
  isApprovedInstructor,
  getInstructorProfile,
  updateInstructorProfile,
  getActiveInstructors,
  getInstructorStats
} = instructorService