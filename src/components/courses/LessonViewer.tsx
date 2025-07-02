'use client'

import { useState, useEffect } from 'react'
import { Lesson, Assignment, CodeExample, CourseData } from '@/lib/data/courses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from './CodeEditor'
import { MarkdownViewer } from './MarkdownViewer'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { 
  BookOpen, 
  Code, 
  FileText, 
  PlayCircle, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Copy,
  RotateCcw,
  Lock,
  ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { EnrollmentService } from '@/services/enrollmentService'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/services/paymentService'

interface LessonViewerProps {
  lesson: Lesson
  savedCode: Record<string, string>
  onCodeSave: (assignmentId: string, code: string) => void
  courseId: string
  course?: CourseData
}

export function LessonViewer({ lesson, savedCode, onCodeSave, courseId, course }: LessonViewerProps) {
  const router = useRouter()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({})
  const [assignmentResults, setAssignmentResults] = useState<Record<string, any>>({})
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isPreviewLesson, setIsPreviewLesson] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccessStatus()
  }, [courseId, lesson.id])

  const checkAccessStatus = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        const purchased = await EnrollmentService.hasPurchasedCourse(user.uid, courseId)
        setHasPurchased(purchased)
      }
      
      // Check if this lesson is a preview lesson
      if (course?.previewLessons?.includes(lesson.id)) {
        setIsPreviewLesson(true)
      }
    } catch (error) {
      console.error('Error checking access status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCourse = () => {
    router.push(`/courses/${courseId}/purchase`)
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleSolution = (assignmentId: string) => {
    setShowSolutions(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }))
  }

  const runCode = (assignmentId: string, code: string) => {
    // Hier zou je de code kunnen evalueren
    // Voor nu simuleren we alleen het resultaat
    try {
      // Simuleer code uitvoering
      setAssignmentResults({
        ...assignmentResults,
        [assignmentId]: {
          success: true,
          output: "Code uitgevoerd! (Simulatie - echte uitvoering komt later)"
        }
      })
    } catch (error) {
      setAssignmentResults({
        ...assignmentResults,
        [assignmentId]: {
          success: false,
          error: "Er ging iets mis bij het uitvoeren van de code"
        }
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  // Show locked content if user hasn't purchased and it's not a preview lesson
  if (!hasPurchased && !isPreviewLesson) {
    return (
      <Card className="text-center">
        <CardContent className="p-12">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Deze les is vergrendeld</h2>
          <p className="text-muted-foreground mb-6">
            Koop de volledige cursus om toegang te krijgen tot deze les en alle andere content.
          </p>
          {course && (
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(course.price, course.currency)}
              </div>
              <Button size="lg" onClick={handleBuyCourse}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Koop deze cursus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show preview banner if it's a preview lesson */}
      {isPreviewLesson && !hasPurchased && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Dit is een gratis preview les</span>
              </div>
              <Button size="sm" onClick={handleBuyCourse}>
                Krijg volledige toegang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Video Section (if available) */}
      {lesson.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <VideoPlayer
              videoUrl={lesson.videoUrl}
              lessonId={lesson.id}
              courseId={courseId}
              className="aspect-video"
              onComplete={() => {
                // This will be handled by the parent component
                console.log('Lesson completed via video player')
              }}
              onProgressUpdate={(progress) => {
                // Optional: Update UI based on progress
                console.log(`Video progress: ${progress}%`)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Les Inhoud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownViewer content={lesson.content} />
        </CardContent>
      </Card>

      {/* Code Examples */}
      {lesson.codeExamples && lesson.codeExamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Voorbeelden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={lesson.codeExamples[0].id}>
              <TabsList>
                {lesson.codeExamples.map((example) => (
                  <TabsTrigger key={example.id} value={example.id}>
                    {example.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {lesson.codeExamples.map((example) => (
                <TabsContent key={example.id} value={example.id} className="space-y-4">
                  {example.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">{example.explanation}</p>
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(example.code, example.id)}
                      >
                        {copiedCode === example.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Gekopieerd
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Kopieer
                          </>
                        )}
                      </Button>
                    </div>
                    <CodeEditor
                      value={example.code}
                      language={example.language}
                      readOnly
                      height="200px"
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Assignments */}
      {lesson.assignments && lesson.assignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Code className="w-5 h-5" />
            Opdrachten
          </h3>
          {lesson.assignments.map((assignment, index) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Opdracht {index + 1}: {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    assignment.difficulty === 'easy' && "bg-green-100 text-green-700",
                    assignment.difficulty === 'medium' && "bg-yellow-100 text-yellow-700",
                    assignment.difficulty === 'hard' && "bg-red-100 text-red-700"
                  )}>
                    {assignment.difficulty === 'easy' && 'Makkelijk'}
                    {assignment.difficulty === 'medium' && 'Gemiddeld'}
                    {assignment.difficulty === 'hard' && 'Moeilijk'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code Editor for Assignment */}
                {assignment.type === 'code' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Jouw Code:</label>
                        <div className="flex gap-2">
                          {assignment.initialCode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCodeSave(assignment.id, assignment.initialCode || '')}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Reset
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => runCode(assignment.id, savedCode[assignment.id] || assignment.initialCode || '')}
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Run Code
                          </Button>
                        </div>
                      </div>
                      <CodeEditor
                        value={savedCode[assignment.id] || assignment.initialCode || ''}
                        onChange={(value) => onCodeSave(assignment.id, value || '')}
                        language="python"
                        height="300px"
                      />
                    </div>

                    {/* Code Output */}
                    {assignmentResults[assignment.id] && (
                      <div className={cn(
                        "rounded-lg p-4 font-mono text-sm",
                        assignmentResults[assignment.id].success 
                          ? "bg-green-50 border border-green-200 text-green-900"
                          : "bg-red-50 border border-red-200 text-red-900"
                      )}>
                        <div className="font-semibold mb-1">Output:</div>
                        {assignmentResults[assignment.id].output || assignmentResults[assignment.id].error}
                      </div>
                    )}
                  </>
                )}

                {/* Hints */}
                {assignment.hints && assignment.hints.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Hints
                    </h4>
                    <ul className="space-y-1">
                      {assignment.hints.map((hint, i) => (
                        <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Solution */}
                {assignment.solution && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSolution(assignment.id)}
                      className="mb-2"
                    >
                      {showSolutions[assignment.id] ? 'Verberg' : 'Toon'} Oplossing
                    </Button>
                    {showSolutions[assignment.id] && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Oplossing:</h4>
                        <CodeEditor
                          value={assignment.solution}
                          language="python"
                          readOnly
                          height="200px"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Type Assignment */}
                {assignment.type === 'quiz' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Quiz functionaliteit komt binnenkort...
                    </p>
                  </div>
                )}

                {/* Project Type Assignment */}
                {assignment.type === 'project' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-900 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h4 className="font-medium">Project Opdracht</h4>
                    </div>
                    <p className="text-sm text-purple-800">
                      Dit is een grotere opdracht. Neem de tijd om alle aspecten te implementeren.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aanvullende Bronnen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson.resources.map((resource, i) => (
                <li key={i}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {resource.title}
                    <span className="text-xs text-gray-500">({resource.type})</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}