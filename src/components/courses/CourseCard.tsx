'use client'

import { CourseData } from '@/lib/data/courses'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InstructorBadge } from '@/components/ui/InstructorBadge'
import { Clock, Users, Star, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CourseCardProps {
  course: CourseData
}

export function CourseCard({ course }: CourseCardProps) {
  // Format duration - it's already a string in CourseData
  const formatDuration = (duration: string) => {
    return duration
  }

  // Format price
  const formatPrice = (price: number, currency: string) => {
    return `€${price}`
  }

  // Format rating
  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Gevorderd':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Expert':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get level label - already in Dutch
  const getLevelLabel = (level: string) => {
    return level
  }

  return (
    <Card className="group h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-blue-500" />
          </div>
        )}
        
        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </span>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full shadow-sm">
            {formatPrice(course.price, course.currency)}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {course.shortDescription || course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Instructor */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Door</span>
          <InstructorBadge name={course.instructor} size="sm" />
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.modules.length} modules</span>
          </div>
          {course.studentsCount && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.studentsCount} studenten</span>
            </div>
          )}
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{formatRating(course.rating)}</span>
            </div>
          )}
        </div>

        {/* Efficiency Gains - New Section */}
        {course.efficiencyGains && (
          <div className="mt-4 bg-green-50 rounded-lg p-3 space-y-1">
            <h4 className="text-sm font-semibold text-green-900 flex items-center gap-1">
              <Star className="w-4 h-4 fill-green-600 text-green-600" />
              ROI & Efficiency
            </h4>
            <div className="text-xs space-y-0.5 text-green-800">
              {course.efficiencyGains.timePerWeek && (
                <p>⏱️ {course.efficiencyGains.timePerWeek}</p>
              )}
              {course.efficiencyGains.costSavings && (
                <p>💰 {course.efficiencyGains.costSavings}</p>
              )}
              {course.efficiencyGains.productivityBoost && (
                <p>🚀 {course.efficiencyGains.productivityBoost}</p>
              )}
              {course.efficiencyGains.roi && (
                <p className="font-semibold">📈 {course.efficiencyGains.roi}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Course Actions */}
      <CardFooter className="pt-3">
        <div className="w-full space-y-2">
          <Link href={`/cursussen/${course.id}`} className="w-full">
            <Button 
              className="w-full group-hover:bg-blue-600 transition-colors" 
              size="default"
            >
              Bekijk cursus
            </Button>
          </Link>
          <p className="text-xs text-gray-500 text-center">
            Direct toegang na aankoop
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}