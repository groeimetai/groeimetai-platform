'use client'

import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils/video'
import { PlayCircle, CheckCircle } from 'lucide-react'

interface VideoProgressIndicatorProps {
  progress: number
  duration?: number
  currentTime?: number
  completed?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTime?: boolean
  className?: string
}

export function VideoProgressIndicator({
  progress,
  duration,
  currentTime,
  completed = false,
  size = 'md',
  showTime = false,
  className,
}: VideoProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {completed ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : progress > 0 ? (
            <PlayCircle className="w-4 h-4 text-blue-600" />
          ) : null}
          
          {showTime && duration && currentTime !== undefined && (
            <span className="text-xs text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
        
        <span className={cn(
          'text-xs font-medium',
          completed ? 'text-green-600' : 'text-gray-600'
        )}>
          {completed ? 'Voltooid' : `${Math.round(progress)}%`}
        </span>
      </div>
      
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            completed ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}

// Compact version for lists
export function VideoProgressBadge({
  progress,
  completed = false,
  className,
}: {
  progress: number
  completed?: boolean
  className?: string
}) {
  if (progress === 0 && !completed) return null

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      completed
        ? 'bg-green-100 text-green-700'
        : 'bg-blue-100 text-blue-700',
      className
    )}>
      {completed ? (
        <>
          <CheckCircle className="w-3 h-3" />
          <span>Voltooid</span>
        </>
      ) : (
        <>
          <PlayCircle className="w-3 h-3" />
          <span>{Math.round(progress)}%</span>
        </>
      )}
    </div>
  )
}