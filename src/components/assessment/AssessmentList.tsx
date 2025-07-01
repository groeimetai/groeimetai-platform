import { useState, useEffect } from 'react'
import { Assessment, AssessmentAttempt } from '@/types'
import { AssessmentService } from '@/services/assessmentService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, FileQuestion, Trophy, Lock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface AssessmentListProps {
  courseId: string
  userId: string
  onAssessmentSelect?: (assessment: Assessment) => void
}

interface AssessmentWithAttempts extends Assessment {
  attempts: AssessmentAttempt[]
  bestAttempt: AssessmentAttempt | null
  canStart: boolean
  canStartReason?: string
  nextAttemptTime?: Date
}

export function AssessmentList({
  courseId,
  userId,
  onAssessmentSelect,
}: AssessmentListProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentWithAttempts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const courseAssessments = await AssessmentService.getCourseAssessments(courseId)
        
        const assessmentsWithAttempts = await Promise.all(
          courseAssessments.map(async (assessment) => {
            const attempts = await AssessmentService.getUserAssessmentAttempts(
              userId,
              assessment.id
            )
            const bestAttempt = await AssessmentService.getBestAttempt(
              userId,
              assessment.id
            )
            const canStartResult = await AssessmentService.canStartNewAttempt(
              userId,
              assessment.id
            )

            return {
              ...assessment,
              attempts,
              bestAttempt,
              canStart: canStartResult.canStart,
              canStartReason: canStartResult.reason,
              nextAttemptTime: canStartResult.nextAttemptTime,
            }
          })
        )

        setAssessments(assessmentsWithAttempts)
      } catch (error) {
        console.error('Error fetching assessments:', error)
        toast({
          title: 'Error',
          description: 'Failed to load assessments',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [courseId, userId])

  const handleStartAssessment = (assessment: AssessmentWithAttempts) => {
    if (!assessment.canStart) {
      toast({
        title: 'Cannot start assessment',
        description: assessment.canStartReason || 'Please try again later',
        variant: 'destructive',
      })
      return
    }

    if (onAssessmentSelect) {
      onAssessmentSelect(assessment)
    } else {
      router.push(`/courses/${courseId}/assessment/${assessment.id}`)
    }
  }

  const getNextAttemptText = (assessment: AssessmentWithAttempts) => {
    if (!assessment.nextAttemptTime) return null

    const hoursUntilNext = Math.ceil(
      (assessment.nextAttemptTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    )

    if (hoursUntilNext > 24) {
      const days = Math.ceil(hoursUntilNext / 24)
      return `Available in ${days} day${days > 1 ? 's' : ''}`
    }

    return `Available in ${hoursUntilNext} hour${hoursUntilNext > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No assessments available for this course</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => {
        const isPassed = assessment.bestAttempt?.passed || false
        const hasAttempts = assessment.attempts.length > 0
        const attemptsRemaining = assessment.maxAttempts
          ? assessment.maxAttempts - assessment.attempts.length
          : null

        return (
          <Card key={assessment.id} className={isPassed ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {assessment.title}
                    {isPassed && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{assessment.description}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {isPassed && (
                    <Badge variant="success">
                      Passed: {assessment.bestAttempt?.score.toFixed(1)}%
                    </Badge>
                  )}
                  {!isPassed && hasAttempts && (
                    <Badge variant="secondary">
                      Best: {assessment.bestAttempt?.score.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Assessment Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.questions.length} questions</span>
                  </div>
                  {assessment.timeLimit && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{assessment.timeLimit} minutes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>Pass: {assessment.passingScore}%</span>
                  </div>
                  {assessment.maxAttempts && (
                    <div className="flex items-center gap-2">
                      <span>
                        Attempts: {assessment.attempts.length}/{assessment.maxAttempts}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Best Score */}
                {hasAttempts && assessment.bestAttempt && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Best Score</span>
                      <span>Passing Score: {assessment.passingScore}%</span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={assessment.bestAttempt.score}
                        className="h-2"
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary"
                        style={{ left: `${assessment.passingScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {assessment.canStart && attemptsRemaining !== null && (
                      <span>{attemptsRemaining} attempts remaining</span>
                    )}
                    {!assessment.canStart && assessment.nextAttemptTime && (
                      <span>{getNextAttemptText(assessment)}</span>
                    )}
                    {!assessment.canStart &&
                      assessment.canStartReason === 'Already passed assessment' && (
                        <span className="text-green-600">
                          You've already passed this assessment
                        </span>
                      )}
                  </div>
                  <Button
                    onClick={() => handleStartAssessment(assessment)}
                    disabled={!assessment.canStart}
                    variant={isPassed ? 'outline' : 'default'}
                  >
                    {!assessment.canStart && <Lock className="mr-2 h-4 w-4" />}
                    {isPassed ? 'Retake Assessment' : 'Start Assessment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}