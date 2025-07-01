'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, Settings, Maximize, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useVideoProgress } from '@/hooks/useVideoProgress'
import { formatTime } from '@/lib/utils/video'

interface VideoPlayerProps {
  videoUrl: string
  lessonId: string
  courseId: string
  onComplete?: () => void
  onProgressUpdate?: (progress: number) => void
  autoPlay?: boolean
  className?: string
}

const QUALITY_OPTIONS = [
  { label: '1080p (HD)', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: 'Auto', value: 'auto' },
]

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onComplete,
  onProgressUpdate,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { saveProgress, getProgress } = useVideoProgress()

  // Auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying && !isDragging) {
        setShowControls(false)
      }
    }

    const showControlsTemporarily = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', showControlsTemporarily)
      container.addEventListener('mouseleave', hideControls)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', showControlsTemporarily)
        container.removeEventListener('mouseleave', hideControls)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, isDragging])

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!videoRef.current) return

      const progress = await getProgress(courseId, lessonId)
      if (progress && progress.timestamp > 0) {
        videoRef.current.currentTime = progress.timestamp
        setCurrentTime(progress.timestamp)
      }
    }

    loadProgress()
  }, [courseId, lessonId, getProgress])

  // Save progress periodically
  useEffect(() => {
    if (!videoRef.current || !duration) return

    const saveInterval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const progressPercentage = (videoRef.current.currentTime / duration) * 100
        saveProgress(
          courseId,
          lessonId,
          videoRef.current.currentTime,
          progressPercentage,
          progressPercentage >= 90
        )

        if (onProgressUpdate) {
          onProgressUpdate(progressPercentage)
        }
      }
    }, 5000) // Save every 5 seconds

    return () => clearInterval(saveInterval)
  }, [courseId, lessonId, duration, isPlaying, saveProgress, onProgressUpdate])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)

    // Update buffered amount
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      setBuffered((bufferedEnd / duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      const progressPercentage = 100
      saveProgress(courseId, lessonId, videoRef.current.currentTime, progressPercentage, true)
      if (onComplete) {
        onComplete()
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality)
    // In a real implementation, you would switch video sources here
    // For now, this is a placeholder
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const skipForward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        className
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        autoPlay={autoPlay}
      />

      {/* Video Controls */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
          >
            <Play className="w-12 h-12 text-white fill-white" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div
            ref={progressBarRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={handleSeek}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            {/* Buffered Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Play Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )}
              </Button>

              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={skipForward}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              {/* Volume */}
              <div className="relative flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
                {showVolumeSlider && (
                  <div
                    className="absolute left-10 bg-black/90 p-2 rounded"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              {/* Time Display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {playbackSpeed}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => handlePlaybackSpeedChange(speed)}
                      className={cn(
                        speed === playbackSpeed && 'bg-blue-500/20'
                      )}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quality Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {QUALITY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleQualityChange(option.value)}
                      className={cn(
                        option.value === quality && 'bg-blue-500/20'
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}