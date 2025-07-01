import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AssessmentTimerProps {
  timeLimit?: number // in minutes
  startTime: Date
  onTimeExpired?: () => void
}

export function AssessmentTimer({
  timeLimit,
  startTime,
  onTimeExpired,
}: AssessmentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!timeLimit) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60)
      const remaining = Math.max(0, timeLimit - elapsedMinutes)

      setTimeRemaining(remaining)

      if (remaining === 0 && !isExpired) {
        setIsExpired(true)
        onTimeExpired?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLimit, startTime, onTimeExpired, isExpired])

  if (!timeLimit) return null

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes * 60) % 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (!timeRemaining) return 'default'
    if (timeRemaining < 5) return 'destructive'
    if (timeRemaining < 15) return 'warning'
    return 'default'
  }

  return (
    <Badge variant={getTimerColor() as any} className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      {timeRemaining !== null && formatTime(timeRemaining)}
    </Badge>
  )
}