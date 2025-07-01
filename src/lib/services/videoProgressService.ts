import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface VideoProgress {
  userId: string
  courseId: string
  lessonId: string
  timestamp: number // Current playback position in seconds
  progress: number // Progress percentage (0-100)
  completed: boolean
  lastWatched: Date
  totalWatchTime: number // Total time spent watching in seconds
}

export interface LessonProgress {
  courseId: string
  lessonId: string
  progress: number
  completed: boolean
  lastWatched: Date
}

// Get video progress for a specific lesson
export async function getVideoProgress(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<VideoProgress | null> {
  try {
    const progressId = `${userId}_${courseId}_${lessonId}`
    const docRef = doc(db, 'videoProgress', progressId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        lastWatched: data.lastWatched?.toDate(),
      } as VideoProgress
    }

    return null
  } catch (error) {
    console.error('Error getting video progress:', error)
    return null
  }
}

// Save or update video progress
export async function saveVideoProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  timestamp: number,
  progress: number,
  completed: boolean = false
): Promise<void> {
  try {
    const progressId = `${userId}_${courseId}_${lessonId}`
    const progressRef = doc(db, 'videoProgress', progressId)

    const progressData = {
      userId,
      courseId,
      lessonId,
      timestamp,
      progress,
      completed,
      lastWatched: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(progressRef, progressData, { merge: true })

    // Also update the user's course progress
    await updateCourseProgress(userId, courseId, lessonId, completed)
  } catch (error) {
    console.error('Error saving video progress:', error)
    throw error
  }
}

// Update overall course progress
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<void> {
  try {
    const courseProgressRef = doc(db, 'courseProgress', `${userId}_${courseId}`)

    const courseProgressData: any = {
      userId,
      courseId,
      lastAccessedLesson: lessonId,
      lastAccessed: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    if (completed) {
      // Get existing progress to update completed lessons
      const progressQuery = query(
        collection(db, 'videoProgress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('completed', '==', true)
      )

      const snapshot = await getDocs(progressQuery)
      const completedLessons = snapshot.docs.map(doc => doc.data().lessonId)

      courseProgressData.completedLessons = completedLessons
      courseProgressData.completedLessonsCount = completedLessons.length
    }

    await setDoc(courseProgressRef, courseProgressData, { merge: true })
  } catch (error) {
    console.error('Error updating course progress:', error)
  }
}

// Get all lesson progress for a course
export async function getCourseVideoProgress(
  userId: string,
  courseId: string
): Promise<LessonProgress[]> {
  try {
    const progressQuery = query(
      collection(db, 'videoProgress'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    )

    const snapshot = await getDocs(progressQuery)
    const progress: LessonProgress[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      progress.push({
        courseId: data.courseId,
        lessonId: data.lessonId,
        progress: data.progress,
        completed: data.completed,
        lastWatched: data.lastWatched?.toDate(),
      })
    })

    return progress
  } catch (error) {
    console.error('Error getting course video progress:', error)
    return []
  }
}

// Get recently watched lessons
export async function getRecentlyWatchedLessons(
  userId: string,
  limitCount: number = 5
): Promise<VideoProgress[]> {
  try {
    const progressQuery = query(
      collection(db, 'videoProgress'),
      where('userId', '==', userId),
      where('progress', '>', 0),
      orderBy('lastWatched', 'desc'),
      firestoreLimit(limitCount)
    )

    const snapshot = await getDocs(progressQuery)
    const recentlyWatched: VideoProgress[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      recentlyWatched.push({
        ...data,
        lastWatched: data.lastWatched?.toDate(),
      } as VideoProgress)
    })

    return recentlyWatched
  } catch (error) {
    console.error('Error getting recently watched lessons:', error)
    return []
  }
}

// Calculate total watch time for a user
export async function getTotalWatchTime(userId: string): Promise<number> {
  try {
    const progressQuery = query(
      collection(db, 'videoProgress'),
      where('userId', '==', userId)
    )

    const snapshot = await getDocs(progressQuery)
    let totalTime = 0

    snapshot.forEach((doc) => {
      const data = doc.data()
      totalTime += data.totalWatchTime || 0
    })

    return totalTime
  } catch (error) {
    console.error('Error calculating total watch time:', error)
    return 0
  }
}

// Mark lesson as watched (for auto-advance)
export async function markLessonAsWatched(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  try {
    await saveVideoProgress(userId, courseId, lessonId, 0, 100, true)
  } catch (error) {
    console.error('Error marking lesson as watched:', error)
    throw error
  }
}