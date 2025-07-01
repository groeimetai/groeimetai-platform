export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function parseVideoUrl(url: string): {
  provider: 'youtube' | 'vimeo' | 'direct' | 'unknown'
  videoId?: string
} {
  // YouTube URL patterns
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  if (youtubeMatch) {
    return { provider: 'youtube', videoId: youtubeMatch[1] }
  }

  // Vimeo URL patterns
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { provider: 'vimeo', videoId: vimeoMatch[1] }
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)$/i.test(url)) {
    return { provider: 'direct' }
  }

  return { provider: 'unknown' }
}

export function getVideoThumbnail(url: string): string | null {
  const { provider, videoId } = parseVideoUrl(url)

  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    case 'vimeo':
      // Vimeo requires API call for thumbnail
      return null
    case 'direct':
      // Can't get thumbnail from direct video
      return null
    default:
      return null
  }
}

export function calculateWatchPercentage(
  currentTime: number,
  duration: number
): number {
  if (!duration || duration === 0) return 0
  return Math.min(Math.round((currentTime / duration) * 100), 100)
}

export function isVideoCompleted(
  currentTime: number,
  duration: number,
  threshold: number = 90
): boolean {
  return calculateWatchPercentage(currentTime, duration) >= threshold
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes} min`
}

// Get optimal video quality based on connection speed
export function getOptimalVideoQuality(): string {
  if ('connection' in navigator && 'effectiveType' in (navigator as any).connection) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return '360'
      case '3g':
        return '480'
      case '4g':
        return '720'
      default:
        return '1080'
    }
  }

  return 'auto'
}

// Video URL validation
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false

  const { provider } = parseVideoUrl(url)
  return provider !== 'unknown'
}

// Generate video embed URL
export function getVideoEmbedUrl(url: string): string | null {
  const { provider, videoId } = parseVideoUrl(url)

  switch (provider) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`
    case 'direct':
      return url
    default:
      return null
  }
}