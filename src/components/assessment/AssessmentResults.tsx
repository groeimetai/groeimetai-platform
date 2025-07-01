import { Assessment, AssessmentAttempt } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Trophy, AlertCircle, Clock } from 'lucide-react'
import { AssessmentService } from '@/services/assessmentService'
import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'

interface AssessmentResultsProps {
  assessment: Assessment
  attempt: AssessmentAttempt
  onRetry?: () => void
  onBack?: () => void
  showCertificateEligibility?: boolean
}

export function AssessmentResults({
  assessment,
  attempt,
  onRetry,
  onBack,
  showCertificateEligibility = true,
}: AssessmentResultsProps) {
  const [canRetry, setCanRetry] = useState(false)
  const [retryInfo, setRetryInfo] = useState<{ reason?: string; nextAttemptTime?: Date }>({})
  const isPassed = attempt.score >= assessment.passingScore

  useEffect(() => {
    const checkRetryStatus = async () => {
      try {
        const result = await AssessmentService.canStartNewAttempt(
          attempt.userId,
          attempt.assessmentId
        )
        setCanRetry(result.canStart)
        setRetryInfo({
          reason: result.reason,
          nextAttemptTime: result.nextAttemptTime,
        })
      } catch (error) {
        console.error('Error checking retry status:', error)
      }
    }

    checkRetryStatus()
  }, [attempt.userId, attempt.assessmentId])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreMessage = () => {
    if (isPassed) {
      if (attempt.score >= 90) {
        return 'Outstanding performance!'
      } else if (attempt.score >= 80) {
        return 'Great job!'
      } else {
        return 'Well done!'
      }
    } else {
      return 'Keep practicing and try again!'
    }
  }

  const getNextAttemptMessage = () => {
    if (!retryInfo.nextAttemptTime) return null

    const hoursUntilNext = Math.ceil(
      (retryInfo.nextAttemptTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    )

    return `You can retry in ${hoursUntilNext} hours`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isPassed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <h2 className="text-4xl font-bold">{attempt.score.toFixed(1)}%</h2>
              <p className="text-lg text-muted-foreground mt-2">{getScoreMessage()}</p>
            </div>

            <Badge
              variant={isPassed ? 'success' : 'destructive'}
              className="text-lg py-2 px-4"
            >
              {isPassed ? 'PASSED' : 'NOT PASSED'}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your Score</span>
              <span>Passing Score: {assessment.passingScore}%</span>
            </div>
            <div className="relative">
              <Progress value={attempt.score} className="h-3" />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{ left: `${assessment.passingScore}%` }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="font-semibold">
                      {attempt.answers.filter((a) => a.isCorrect).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <p className="font-semibold">
                      {attempt.answers.filter((a) => !a.isCorrect).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{formatTime(attempt.timeSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="font-semibold">
                    {attempt.answers.reduce((sum, a) => sum + a.points, 0)} /{' '}
                    {assessment.questions.reduce((sum, q) => sum + q.points, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificate Eligibility */}
          {showCertificateEligibility && isPassed && (
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Certificate Eligible!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You have met the requirements for course certification.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={onBack}>
              Back to Course
            </Button>
            {canRetry && onRetry && (
              <Button onClick={onRetry}>
                Retry Assessment
              </Button>
            )}
            {!canRetry && retryInfo.reason && (
              <div className="text-sm text-muted-foreground">
                {retryInfo.reason === 'Cooldown period active' && getNextAttemptMessage()}
                {retryInfo.reason === 'Maximum attempts reached' && 'Maximum attempts reached'}
                {retryInfo.reason === 'Already passed assessment' && 'You have already passed this assessment'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}