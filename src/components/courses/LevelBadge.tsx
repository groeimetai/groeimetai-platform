import { cn } from '@/lib/utils'

export interface LevelBadgeProps {
  level: 'Beginner' | 'Gevorderd' | 'Expert'
  className?: string
}

/**
 * Badge component for displaying course difficulty levels with color coding
 * - Green: Beginner
 * - Orange: Gevorderd  
 * - Red: Expert
 */
export function LevelBadge({ level, className }: LevelBadgeProps) {
  const levelConfig = {
    'Beginner': {
      label: 'Beginner',
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    'Gevorderd': {
      label: 'Gevorderd',
      className: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    'Expert': {
      label: 'Expert',
      className: 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const config = levelConfig[level] || levelConfig['Beginner'] // fallback voor safety

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}