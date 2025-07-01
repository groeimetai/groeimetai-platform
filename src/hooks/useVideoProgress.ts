'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import {
  getVideoProgress,
  saveVideoProgress,
  getCourseVideoProgress,
  getRecentlyWatchedLessons,
  VideoProgress,
  LessonProgress,
} from '@/lib/services/videoProgressService'

export function useVideoProgress() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProgress = useCallback(
    async (
      courseId: string,
      lessonId: string,
      timestamp: number,
      progress: number,
      completed: boolean = false
    ) => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        await saveVideoProgress(user.uid, courseId, lessonId, timestamp, progress, completed)
      } catch (err) {
        console.error('Error saving video progress:', err)
        setError('Failed to save progress')
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const getProgress = useCallback(
    async (courseId: string, lessonId: string): Promise<VideoProgress | null> => {
      if (!user) return null

      try {
        setLoading(true)
        setError(null)
        const progress = await getVideoProgress(user.uid, courseId, lessonId)
        return progress
      } catch (err) {
        console.error('Error getting video progress:', err)
        setError('Failed to load progress')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const getCourseProgress = useCallback(
    async (courseId: string): Promise<LessonProgress[]> => {
      if (!user) return []

      try {
        setLoading(true)
        setError(null)
        const progress = await getCourseVideoProgress(user.uid, courseId)
        return progress
      } catch (err) {
        console.error('Error getting course progress:', err)
        setError('Failed to load course progress')
        return []
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const getRecentlyWatched = useCallback(
    async (limit: number = 5): Promise<VideoProgress[]> => {
      if (!user) return []

      try {
        setLoading(true)
        setError(null)
        const recentlyWatched = await getRecentlyWatchedLessons(user.uid, limit)
        return recentlyWatched
      } catch (err) {
        console.error('Error getting recently watched:', err)
        setError('Failed to load recently watched')
        return []
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  return {
    saveProgress,
    getProgress,
    getCourseProgress,
    getRecentlyWatched,
    loading,
    error,
  }
}

// Hook to track video watch time
export function useVideoWatchTime(lessonId: string, courseId: string) {
  const { user } = useAuth()
  const [watchTime, setWatchTime] = useState(0)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (!user || !isTracking) return

    const startTime = Date.now()

    const trackTime = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
      setWatchTime(prev => prev + elapsedTime)
    }

    const interval = setInterval(trackTime, 10000) // Update every 10 seconds

    return () => {
      clearInterval(interval)
      trackTime() // Final update
    }
  }, [user, isTracking])

  const startTracking = () => setIsTracking(true)
  const stopTracking = () => setIsTracking(false)

  return {
    watchTime,
    startTracking,
    stopTracking,
  }
}