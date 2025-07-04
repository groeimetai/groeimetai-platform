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
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase/db-getter'
import { Course, Lesson, Enrollment, Author } from '@/types'
import courses from '@/lib/data/courses'
import type { CourseData } from '@/lib/data/courses'

export class CourseService {
  /**
   * Get all courses (static data fallback for compatibility)
   */
  static async getAllCourses(): Promise<Course[]> {
    try {
      // Try to get courses from Firebase first
      return await this.getPublishedCourses();
    } catch (error) {
      console.warn('Firebase courses not available, using static data:', error);
      // Fallback to static course data
      return courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        shortDescription: course.targetAudience || '',
        imageUrl: course.thumbnail,
        price: course.price,
        currency: course.currency || 'EUR',
        instructorId: 'static-instructor',
        instructor: {
          id: 'static-instructor',
          email: 'instructor@groeimetai.nl',
          displayName: 'GroeimetAI Instructor',
          role: 'instructor' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        category: course.category,
        level: course.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
        duration: course.modules ? course.modules.reduce((total, module) => {
          return total + (module.lessons ? module.lessons.reduce((lessonTotal, lesson) => {
            const duration = parseInt(lesson.duration.replace(/\D/g, '')) || 0;
            return lessonTotal + duration;
          }, 0) : 0);
        }, 0) : 0,
        lessonsCount: course.modules ? course.modules.reduce((total, module) => total + (module.lessons ? module.lessons.length : 0), 0) : 0,
        studentsCount: 0,
        rating: 0,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
  }
  /**
   * Get all published courses
   */
  static async getPublishedCourses(): Promise<Course[]> {
    // Only run in browser
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const q = query(
        collection(getDb(), 'courses'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]
    } catch (error) {
      console.error('Get published courses error:', error)
      throw error
    }
  }

  /**
   * Get courses by category
   */
  static async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const q = query(
        collection(getDb(), 'courses'),
        where('category', '==', category),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]
    } catch (error) {
      console.error('Get courses by category error:', error)
      throw error
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(getDb(), 'courses', courseId))
      if (!courseDoc.exists()) return null

      return {
        id: courseDoc.id,
        ...courseDoc.data(),
      } as Course
    } catch (error) {
      console.error('Get course by ID error:', error)
      throw error
    }
  }

  /**
   * Get course lessons
   */
  static async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const q = query(
        collection(getDb(), 'lessons'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[]
    } catch (error) {
      console.error('Get course lessons error:', error)
      throw error
    }
  }

  /**
   * Get lesson by ID
   */
  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonDoc = await getDoc(doc(getDb(), 'lessons', lessonId))
      if (!lessonDoc.exists()) return null

      return {
        id: lessonDoc.id,
        ...lessonDoc.data(),
      } as Lesson
    } catch (error) {
      console.error('Get lesson by ID error:', error)
      throw error
    }
  }

  /**
   * Create new course
   */
  static async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const courseData = {
        ...course,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const docRef = await addDoc(collection(getDb(), 'courses'), courseData)
      return docRef.id
    } catch (error) {
      console.error('Create course error:', error)
      throw error
    }
  }

  /**
   * Update course
   */
  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    try {
      const courseRef = doc(getDb(), 'courses', courseId)
      await updateDoc(courseRef, {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Update course error:', error)
      throw error
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await deleteDoc(doc(getDb(), 'courses', courseId))
    } catch (error) {
      console.error('Delete course error:', error)
      throw error
    }
  }

  /**
   * Create new lesson
   */
  static async createLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const lessonData = {
        ...lesson,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const docRef = await addDoc(collection(getDb(), 'lessons'), lessonData)
      return docRef.id
    } catch (error) {
      console.error('Create lesson error:', error)
      throw error
    }
  }

  /**
   * Update lesson
   */
  static async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    try {
      const lessonRef = doc(getDb(), 'lessons', lessonId)
      await updateDoc(lessonRef, {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Update lesson error:', error)
      throw error
    }
  }

  /**
   * Delete lesson
   */
  static async deleteLesson(lessonId: string): Promise<void> {
    try {
      await deleteDoc(doc(getDb(), 'lessons', lessonId))
    } catch (error) {
      console.error('Delete lesson error:', error)
      throw error
    }
  }

  /**
   * Search courses
   */
  static async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      // Note: This is a basic implementation. For production, consider using
      // a search service like Algolia or Elasticsearch for better search capabilities
      const q = query(
        collection(getDb(), 'courses'),
        where('isPublished', '==', true),
        orderBy('title')
      )
      const querySnapshot = await getDocs(q)
      
      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]

      // Filter by search term (case-insensitive)
      return courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Search courses error:', error)
      throw error
    }
  }

  /**
   * Get authors by user ID
   */
  static async getAuthorsByUserId(userId: string): Promise<Author[]> {
    try {
      const q = query(
        collection(getDb(), 'authors'),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Author[]
    } catch (error) {
      console.error('Get authors by user ID error:', error)
      throw error
    }
  }

  /**
   * Get courses by instructor ID
   */
  static async getCoursesByInstructorId(instructorId: string): Promise<Course[]> {
    try {
      const q = query(
        collection(getDb(), 'courses'),
        where('instructorId', '==', instructorId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]
    } catch (error) {
      console.error('Get courses by instructor ID error:', error)
      throw error
    }
  }
}

// Export singleton instance for compatibility
export const courseService = {
  getAllCourses: CourseService.getAllCourses,
  getPublishedCourses: CourseService.getPublishedCourses,
  getCoursesByCategory: CourseService.getCoursesByCategory,
  getCourseById: CourseService.getCourseById,
  getCourseLessons: CourseService.getCourseLessons,
  getLessonById: CourseService.getLessonById,
  createCourse: CourseService.createCourse,
  updateCourse: CourseService.updateCourse,
  deleteCourse: CourseService.deleteCourse,
  createLesson: CourseService.createLesson,
  updateLesson: CourseService.updateLesson,
  deleteLesson: CourseService.deleteLesson,
  searchCourses: CourseService.searchCourses,
  getAuthorsByUserId: CourseService.getAuthorsByUserId,
  getCoursesByInstructorId: CourseService.getCoursesByInstructorId,
};

// Export individual functions for direct import
export const getCourseById = CourseService.getCourseById;

export default courseService;