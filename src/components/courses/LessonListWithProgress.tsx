'use client'

import { useState, useEffect } from 'react'
import { Module, Lesson } from '@/lib/data/courses'
import { useVideoProgress } from '@/hooks/useVideoProgress'
import { VideoProgressIndicator, VideoProgressBadge } from './VideoProgressIndicator'
import { cn } from '@/lib/utils'
import { PlayCircle, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface LessonListWithProgressProps {
  modules: Module[]
  courseId: string
  currentLessonId: string
  onLessonSelect: (moduleId: string, lessonId: string) => void
  className?: string
}

interface LessonWithProgress extends Lesson {
  progress?: number
  completed?: boolean
  isLocked?: boolean
}

export function LessonListWithProgress({
  modules,
  courseId,
  currentLessonId,
  onLessonSelect,
  className,
}: LessonListWithProgressProps) {
  const { getCourseProgress } = useVideoProgress()
  const [lessonsProgress, setLessonsProgress] = useState<Map<string, { progress: number; completed: boolean }>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getCourseProgress(courseId)
        const progressMap = new Map()
        
        progress.forEach(p => {
          progressMap.set(p.lessonId, {
            progress: p.progress,
            completed: p.completed,
          })
        })
        
        setLessonsProgress(progressMap)
      } catch (error) {
        console.error('Error loading progress:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [courseId, getCourseProgress])

  const getModuleProgress = (module: Module) => {
    const lessons = module.lessons
    const completedCount = lessons.filter(lesson => 
      lessonsProgress.get(lesson.id)?.completed
    ).length
    
    return {
      completed: completedCount,
      total: lessons.length,
      percentage: lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0,
    }
  }

  const isLessonAccessible = (moduleIndex: number, lessonIndex: number) => {
    // First lesson is always accessible
    if (moduleIndex === 0 && lessonIndex === 0) return true

    // Check if previous lesson in same module is completed
    if (lessonIndex > 0) {
      const previousLesson = modules[moduleIndex].lessons[lessonIndex - 1]
      return lessonsProgress.get(previousLesson.id)?.completed || false
    }

    // Check if last lesson of previous module is completed
    if (moduleIndex > 0) {
      const previousModule = modules[moduleIndex - 1]
      const lastLesson = previousModule.lessons[previousModule.lessons.length - 1]
      return lessonsProgress.get(lastLesson.id)?.completed || false
    }

    return false
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Accordion type="single" collapsible className="w-full">
        {modules.map((module, moduleIndex) => {
          const moduleProgress = getModuleProgress(module)
          
          return (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full mr-2">
                  <div className="text-left">
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {moduleProgress.completed} van {moduleProgress.total} lessen voltooid
                    </p>
                  </div>
                  <VideoProgressIndicator
                    progress={moduleProgress.percentage}
                    completed={moduleProgress.percentage === 100}
                    size="sm"
                    className="w-24"
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const progress = lessonsProgress.get(lesson.id)
                    const isAccessible = isLessonAccessible(moduleIndex, lessonIndex)
                    const isCurrent = lesson.id === currentLessonId
                    
                    return (
                      <Button
                        key={lesson.id}
                        variant={isCurrent ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-left p-3 h-auto',
                          !isAccessible && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => isAccessible && onLessonSelect(module.id, lesson.id)}
                        disabled={!isAccessible}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-1">
                            {!isAccessible ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : progress?.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={cn(
                                'font-medium truncate',
                                isCurrent && 'text-blue-600'
                              )}>
                                {lesson.title}
                              </p>
                              <span className="text-xs text-gray-500 ml-2 shrink-0">
                                {lesson.duration}
                              </span>
                            </div>
                            {progress && progress.progress > 0 && (
                              <VideoProgressIndicator
                                progress={progress.progress}
                                completed={progress.completed}
                                size="sm"
                                className="mt-2"
                              />
                            )}
                            {!isAccessible && (
                              <p className="text-xs text-gray-500 mt-1">
                                Voltooi de vorige les om deze te ontgrendelen
                              </p>
                            )}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}