import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Assessment, Answer, AssessmentAttempt } from '@/types'
import { AssessmentService } from '@/services/assessmentService'
import { QuestionComponent } from './QuestionComponent'
import { AssessmentTimer } from './AssessmentTimer'
import { AssessmentResults } from './AssessmentResults'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'

interface AssessmentProps {
  assessment: Assessment
  userId: string
  courseId: string
  onComplete?: (attempt: AssessmentAttempt) => void
}

export function Assessment({
  assessment,
  userId,
  courseId,
  onComplete,
}: AssessmentProps) {
  const router = useRouter()
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [completedAttempt, setCompletedAttempt] = useState<AssessmentAttempt | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [startTime] = useState(new Date())
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (attemptId && answers.length > 0) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
      
      const timer = setTimeout(async () => {
        try {
          await AssessmentService.saveProgress(attemptId, answers)
          toast({
            title: 'Progress saved',
            description: 'Your answers have been saved automatically',
          })
        } catch (error) {
          console.error('Auto-save error:', error)
        }
      }, 30000) // 30 seconds

      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
    }
  }, [answers, attemptId])

  // Start assessment attempt
  useEffect(() => {
    const startAttempt = async () => {
      try {
        const id = await AssessmentService.startAssessmentAttempt(assessment.id, userId)
        setAttemptId(id)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to start assessment',
          variant: 'destructive',
        })
        router.back()
      }
    }

    if (!attemptId) {
      startAttempt()
    }
  }, [assessment.id, userId, attemptId, router])

  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== answer.questionId)
      return [...filtered, answer]
    })
  }, [])

  const handleTimeExpired = useCallback(async () => {
    toast({
      title: 'Time expired',
      description: 'Your assessment has been automatically submitted',
      variant: 'destructive',
    })
    await handleSubmit()
  }, [])

  const handleSubmit = async () => {
    if (!attemptId) return

    setIsSubmitting(true)
    try {
      const attempt = await AssessmentService.submitAssessmentAttempt(attemptId, answers)
      setCompletedAttempt(attempt)
      setShowResults(true)
      
      if (attempt.passed) {
        toast({
          title: 'Congratulations!',
          description: `You passed with ${attempt.score.toFixed(1)}%`,
        })
      } else {
        toast({
          title: 'Assessment completed',
          description: `Your score: ${attempt.score.toFixed(1)}%. You need ${assessment.passingScore}% to pass.`,
          variant: 'destructive',
        })
      }

      onComplete?.(attempt)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setShowSubmitDialog(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateProgress = () => {
    const answeredQuestions = answers.filter((a) => a.answer !== '').length
    return (answeredQuestions / assessment.questions.length) * 100
  }

  if (showResults && completedAttempt) {
    return (
      <AssessmentResults
        assessment={assessment}
        attempt={completedAttempt}
        onRetry={() => window.location.reload()}
        onBack={() => router.back()}
      />
    )
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assessment.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {assessment.description}
              </p>
            </div>
            <AssessmentTimer
              timeLimit={assessment.timeLimit}
              startTime={startTime}
              onTimeExpired={handleTimeExpired}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {assessment.questions.length}
                </span>
                <span>{calculateProgress().toFixed(0)}% complete</span>
              </div>
              <Progress value={calculateProgress()} />
            </div>

            <QuestionComponent
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              answer={currentAnswer}
              onAnswerChange={handleAnswerChange}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex < assessment.questions.length - 1 ? (
                  <Button onClick={handleNextQuestion}>Next</Button>
                ) : (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={isSubmitting || answers.length < assessment.questions.length}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your assessment? You have answered{' '}
              {answers.length} out of {assessment.questions.length} questions.
              {answers.length < assessment.questions.length && (
                <span className="block mt-2 text-destructive">
                  Warning: You haven't answered all questions!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}