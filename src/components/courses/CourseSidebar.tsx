'use client'

import { useState } from 'react'
import { CourseData, Module, Lesson } from '@/lib/data/courses'
import { Button } from '@/components/ui/button'
import { 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  FileText, 
  Code, 
  CheckCircle,
  Lock,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseSidebarProps {
  course: CourseData
  currentLessonId?: string
  onLessonSelect?: (moduleId: string, lessonId: string) => void
  completedLessons?: string[]
}

export function CourseSidebar({ 
  course, 
  currentLessonId, 
  onLessonSelect,
  completedLessons = []
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([course.modules[0]?.id || ''])

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.videoUrl) return <PlayCircle className="w-4 h-4" />
    if (lesson.assignments && lesson.assignments.length > 0) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId)
  }

  const getModuleProgress = (module: Module) => {
    const moduleLessonIds = module.lessons.map(l => l.id)
    const completedInModule = moduleLessonIds.filter(id => completedLessons.includes(id))
    return {
      completed: completedInModule.length,
      total: module.lessons.length,
      percentage: Math.round((completedInModule.length / module.lessons.length) * 100)
    }
  }

  const getTotalProgress = () => {
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    const percentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0
    return {
      completed: completedLessons.length,
      total: totalLessons,
      percentage
    }
  }

  const totalProgress = getTotalProgress()

  return (
    <div className="bg-white rounded-lg shadow-sm border sticky top-4">
      {/* Course Progress */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-2">Voortgang</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{totalProgress.completed} van {totalProgress.total} lessen</span>
            <span>{totalProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Cursus Inhoud</h3>
        <div className="space-y-2">
          {course.modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id)
            const moduleProgress = getModuleProgress(module)
            const isModuleLocked = moduleIndex > 0 && 
              getModuleProgress(course.modules[moduleIndex - 1]).percentage < 100

            return (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={cn(
                    "w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors",
                    isModuleLocked && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isModuleLocked}
                >
                  <div className="flex items-center gap-2 flex-1 text-left">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        Module {moduleIndex + 1}: {module.title}
                      </h4>
                      {moduleProgress.completed > 0 && (
                        <p className="text-xs text-gray-500">
                          {moduleProgress.completed}/{moduleProgress.total} voltooid
                        </p>
                      )}
                    </div>
                    {isModuleLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    {moduleProgress.percentage === 100 && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </button>

                {/* Module Lessons */}
                {isExpanded && !isModuleLocked && (
                  <div className="bg-gray-50 border-t">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = isLessonCompleted(lesson.id)
                      const isCurrent = lesson.id === currentLessonId
                      const isLocked = lessonIndex > 0 && 
                        !isLessonCompleted(module.lessons[lessonIndex - 1].id)

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !isLocked && onLessonSelect?.(module.id, lesson.id)}
                          disabled={isLocked}
                          className={cn(
                            "w-full px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors text-left border-b last:border-0",
                            isCurrent && "bg-blue-50 border-l-2 border-l-blue-500",
                            isCompleted && "text-gray-600",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2",
                                isCurrent ? "border-blue-500" : "border-gray-300"
                              )} />
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson)}
                              <h5 className={cn(
                                "text-sm font-medium truncate",
                                isCurrent ? "text-blue-600" : "text-gray-900"
                              )}>
                                {lesson.title}
                              </h5>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                              </span>
                              {lesson.assignments && lesson.assignments.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {lesson.assignments.length} opdracht{lesson.assignments.length !== 1 ? 'en' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}

                    {/* Module Project */}
                    {module.moduleProject && (
                      <button
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors text-left bg-purple-50",
                          "border-t-2 border-purple-200"
                        )}
                      >
                        <Code className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-purple-900">
                            Module Project
                          </h5>
                          <p className="text-xs text-purple-700">
                            {module.moduleProject.title}
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Certificate Progress */}
      <div className="p-4 border-t">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Certificaat Progress
          </h4>
          <p className="text-xs text-blue-700">
            Voltooi alle modules om je certificaat te ontvangen
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {totalProgress.percentage}% voltooid
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Award icon component (als het niet in lucide-react zit)
function Award({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
      />
    </svg>
  )
}