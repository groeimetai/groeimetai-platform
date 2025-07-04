import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { Enrollment, Progress } from '@/types'
import { objectiveService } from './objectiveService'

import { getDb } from '@/lib/firebase/db-getter';

export class EnrollmentService {
  /**
   * Enroll user in course
   */
  static async enrollUserInCourse(userId: string, courseId: string): Promise<string> {
    try {
      // Check if user is already enrolled
      const existingEnrollment = await this.getUserEnrollment(userId, courseId)
      if (existingEnrollment) {
        throw new Error('User is already enrolled in this course')
      }

      const enrollment: Omit<Enrollment, 'id'> = {
        userId,
        courseId,
        progress: 0,
        completedLessons: [],
        enrolledAt: new Date(),
      }

      const docRef = await addDoc(collection(getDb(), 'enrollments'), enrollment)
      
      // Update objectives related to this course
      await objectiveService.updateObjectiveFromCourseProgress(
        userId,
        courseId,
        'course_started',
        'Started course enrollment'
      )
      
      return docRef.id
    } catch (error) {
      console.error('Enroll user in course error:', error)
      throw error
    }
  }

  /**
   * Get user enrollment for a specific course
   */
  static async getUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    try {
      const q = query(
        collection(getDb(), 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return null

      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Ensure completedLessons is always an array
        completedLessons: data.completedLessons || [],
      } as Enrollment
    } catch (error) {
      console.error('Get user enrollment error:', error)
      throw error
    }
  }

  /**
   * Get all user enrollments
   */
  static async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    try {
      const q = query(
        collection(getDb(), 'enrollments'),
        where('userId', '==', userId),
        orderBy('enrolledAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const enrollments = await Promise.all(querySnapshot.docs.map(async (enrollmentDoc) => {
        const enrollmentData = enrollmentDoc.data() as Omit<Enrollment, 'id'>;
        const courseDocRef = doc(getDb(), 'courses', enrollmentData.courseId);
        const courseDoc = await getDoc(courseDocRef);
        const courseData = courseDoc.exists() ? courseDoc.data() : null;
        
        return {
          id: enrollmentDoc.id,
          ...enrollmentData,
          // Ensure completedLessons is always an array
          completedLessons: enrollmentData.completedLessons || [],
          course: courseData,
        } as Enrollment;
      }));

      return enrollments;
    } catch (error) {
      console.error('Get user enrollments error:', error)
      throw error
    }
  }

  /**
   * Get course enrollments (for instructors/admins)
   */
  static async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    try {
      const q = query(
        collection(getDb(), 'enrollments'),
        where('courseId', '==', courseId),
        orderBy('enrolledAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Enrollment[]
    } catch (error) {
      console.error('Get course enrollments error:', error)
      throw error
    }
  }

  /**
   * Mark lesson as completed
   */
  static async markLessonCompleted(enrollmentId: string, lessonId: string): Promise<void> {
    try {
      const enrollmentRef = doc(getDb(), 'enrollments', enrollmentId)
      const enrollmentDoc = await getDoc(enrollmentRef)
      
      if (!enrollmentDoc.exists()) {
        throw new Error('Enrollment not found')
      }

      const enrollment = enrollmentDoc.data() as Enrollment
      
      // Initialize completedLessons if it doesn't exist
      const currentCompletedLessons = enrollment.completedLessons || []
      
      // Add lesson to completed lessons if not already completed
      if (!currentCompletedLessons.includes(lessonId)) {
        const updatedCompletedLessons = [...currentCompletedLessons, lessonId]
        
        await updateDoc(enrollmentRef, {
          completedLessons: updatedCompletedLessons,
          currentLessonId: lessonId,
        })
        
        // Update objectives related to this course
        await objectiveService.updateObjectiveFromCourseProgress(
          enrollment.userId,
          enrollment.courseId,
          'lesson_completed',
          `Completed lesson: ${lessonId}`,
          { lessonId, lessonsCompleted: updatedCompletedLessons.length }
        )
      }
    } catch (error) {
      console.error('Mark lesson completed error:', error)
      throw error
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateEnrollmentProgress(
    enrollmentId: string, 
    progress: number, 
    currentLessonId?: string
  ): Promise<void> {
    try {
      const enrollmentRef = doc(getDb(), 'enrollments', enrollmentId)
      const updateData: Partial<Enrollment> = {
        progress: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
      }

      if (currentLessonId) {
        updateData.currentLessonId = currentLessonId
      }

      // Mark as completed if progress reaches 100%
      if (progress >= 100) {
        updateData.completedAt = new Date()
      }

      await updateDoc(enrollmentRef, updateData)
      
      // If course is completed, update objectives
      if (progress >= 100) {
        const enrollment = await getDoc(enrollmentRef)
        if (enrollment.exists()) {
          const data = enrollment.data() as Enrollment
          await objectiveService.updateObjectiveFromCourseProgress(
            data.userId,
            data.courseId,
            'course_completed',
            'Completed course',
            { progress: 100 }
          )
        }
      }
    } catch (error) {
      console.error('Update enrollment progress error:', error)
      throw error
    }
  }

  /**
   * Calculate user progress for a course
   */
  static async calculateCourseProgress(userId: string, courseId: string): Promise<Progress | null> {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      if (!enrollment) return null

      // Get total lessons count for the course
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId)
      )
      const lessonsSnapshot = await getDocs(lessonsQuery)
      const totalLessons = lessonsSnapshot.size

      const progress: Progress = {
        userId,
        courseId,
        lessonsCompleted: enrollment.completedLessons.length,
        totalLessons,
        percentage: totalLessons > 0 ? (enrollment.completedLessons.length / totalLessons) * 100 : 0,
        timeSpent: 0, // This would need to be tracked separately
        lastAccessedAt: new Date(),
      }

      return progress
    } catch (error) {
      console.error('Calculate course progress error:', error)
      throw error
    }
  }

  /**
   * Complete enrollment for a course
   */
  static async completeEnrollment(userId: string, courseId: string): Promise<void> {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      if (!enrollment) {
        throw new Error('User is not enrolled in this course')
      }

      await updateDoc(doc(db, 'enrollments', enrollment.id), {
        progress: 100,
        completedAt: new Date(),
      })

      // Update objectives related to course completion
      await objectiveService.updateObjectiveFromCourseProgress(
        userId,
        courseId,
        'course_completed',
        'Completed entire course'
      )
    } catch (error) {
      console.error('Complete enrollment error:', error)
      throw error
    }
  }

  /**
   * Check if user has access to course
   */
  static async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      return enrollment !== null
    } catch (error) {
      console.error('Check course access error:', error)
      return false
    }
  }

  /**
   * Unenroll user from course
   */
  static async unenrollUser(userId: string, courseId: string): Promise<void> {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      if (!enrollment) {
        throw new Error('User is not enrolled in this course')
      }

      await deleteDoc(doc(db, 'enrollments', enrollment.id))
    } catch (error) {
      console.error('Unenroll user error:', error)
      throw error
    }
  }

  /**
   * Check if user has purchased course (enrolled or has payment record)
   */
  static async hasPurchasedCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // First check if user is enrolled
      const enrollment = await this.getUserEnrollment(userId, courseId)
      if (enrollment) return true

      // Check payment records - assuming successful payments create enrollments
      // For now, we rely on enrollment records as proof of purchase
      // In production, you might also check a separate payments collection
      
      return false
    } catch (error) {
      console.error('Check purchase status error:', error)
      return false
    }
  }

  /**
   * Get user's purchased course IDs
   */
  static async getUserPurchasedCourses(userId: string): Promise<string[]> {
    try {
      const enrollments = await this.getUserEnrollments(userId)
      return enrollments.map(enrollment => enrollment.courseId)
    } catch (error) {
      console.error('Get user purchased courses error:', error)
      return []
    }
  }
}