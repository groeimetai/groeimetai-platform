import { cn } from '@/lib/utils'
import { GraduationCap, Sparkles } from 'lucide-react'

interface InstructorBadgeProps {
  name: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function InstructorBadge({ name, className, showIcon = true, size = 'md' }: InstructorBadgeProps) {
  const isGroeimetAI = name === 'GroeimetAI Team' || name === 'GroeimetAI'
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  if (isGroeimetAI) {
    return (
      <span 
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
          'shadow-sm',
          sizeClasses[size],
          className
        )}
        style={{
          boxShadow: '0 1px 3px rgba(147, 51, 234, 0.2)'
        }}
      >
        {showIcon && <Sparkles className={cn(iconSizes[size], 'animate-pulse')} />}
        <span>GroeimetAI</span>
      </span>
    )
  }
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-gray-900',
        className
      )}
    >
      {showIcon && <GraduationCap className={iconSizes[size]} />}
      <span>{name}</span>
    </span>
  )
}