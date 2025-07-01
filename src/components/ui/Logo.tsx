import { cn } from '@/lib/utils'
import { GroeimetAILogoPNG, GroeimetAILogoIcon } from './GroeimetAILogoPNG'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'gradient'
}

export function Logo({ 
  className, 
  showText = true, 
  size = 'md',
  variant = 'default' 
}: LogoProps) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48
  }

  const logoVariant = variant === 'white' ? 'white' : variant === 'gradient' ? 'black' : 'color'
  
  return (
    <GroeimetAILogoPNG 
      variant={logoVariant}
      showText={showText}
      height={sizes[size]}
      className={className}
    />
  )
}

export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <GroeimetAILogoIcon 
      variant="color" 
      className={className}
      size={size}
    />
  )
}