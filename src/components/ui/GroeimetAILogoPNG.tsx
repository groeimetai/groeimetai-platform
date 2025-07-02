import Image from 'next/image'
import { cn } from '@/lib/utils'

interface GroeimetAILogoPNGProps {
  variant?: 'color' | 'black' | 'white'
  showText?: boolean
  className?: string
  height?: number
}

export function GroeimetAILogoPNG({ 
  variant = 'color', 
  showText = true, 
  className,
  height = 40 
}: GroeimetAILogoPNGProps) {
  
  // Calculate width based on aspect ratio
  const aspectRatio = showText ? 7 : 1.8 // Approximate ratios
  const width = height * aspectRatio
  
  // Select the right image based on variant and showText
  let imageSrc = ''
  
  if (showText) {
    switch (variant) {
      case 'white':
        imageSrc = '/images/logo/GroeimetAi_logo_text_white.png'
        break
      case 'black':
        imageSrc = '/images/logo/GroeimetAi_logo_text_black.png'
        break
      default:
        imageSrc = '/images/logo/GroeimetAi_logo_text_black.png' // Default color version
    }
  } else {
    switch (variant) {
      case 'white':
        imageSrc = '/images/logo/GroeimetAi_logo_image_white.png'
        break
      case 'black':
        imageSrc = '/images/logo/GroeimetAi_logo_image_black.png'
        break
      default:
        imageSrc = '/images/logo/GroeimetAi_logo_image_black.png' // Default color version
    }
  }
  
  return (
    <div className={cn('relative inline-block', className)} style={{ height, width }}>
      <Image
        src={imageSrc}
        alt="GroeimetAI"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain"
        priority
      />
    </div>
  )
}

// Export icon-only variant for convenience
export function GroeimetAILogoIcon({ 
  variant = 'color', 
  className,
  size = 40
}: { 
  variant?: 'color' | 'black' | 'white'
  className?: string
  size?: number
}) {
  return <GroeimetAILogoPNG variant={variant} showText={false} className={className} height={size} />
}