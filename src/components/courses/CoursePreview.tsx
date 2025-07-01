'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CourseData, Module, Lesson } from '@/lib/data/courses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lock, 
  PlayCircle, 
  Clock, 
  Users, 
  Star, 
  CheckCircle,
  BookOpen,
  Target,
  Trophy,
  ArrowRight,
  ShoppingCart,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/services/paymentService'
import { auth } from '@/lib/firebase'
import { EnrollmentService } from '@/services/enrollmentService'

interface CoursePreviewProps {
  course: CourseData
  onStartPurchase?: () => void
  onViewLesson?: (lessonId: string) => void
}

export function CoursePreview({ course, onStartPurchase, onViewLesson }: CoursePreviewProps) {
  const router = useRouter()
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPurchaseStatus()
  }, [course.id])

  const checkPurchaseStatus = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        const purchased = await EnrollmentService.hasPurchasedCourse(user.uid, course.id)
        setHasPurchased(purchased)
      }
    } catch (error) {
      console.error('Error checking purchase status:', error)
    } finally {
      setLoading(false)
    }
  }

  const isLessonPreviewable = (lessonId: string) => {
    return course.previewLessons?.includes(lessonId) || false
  }

  const handleBuyCourse = () => {
    if (onStartPurchase) {
      onStartPurchase()
    } else {
      router.push(`/courses/${course.id}/purchase`)
    }
  }

  const handleViewLesson = (lessonId: string) => {
    if (onViewLesson) {
      onViewLesson(lessonId)
    } else {
      router.push(`/courses/${course.id}/lessons/${lessonId}`)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // If user has purchased, redirect to full course viewer
  if (hasPurchased) {
    router.push(`/courses/${course.id}`)
    return null
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{course.title}</CardTitle>
                <CardDescription className="text-lg">
                  {course.shortDescription || course.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(course.price, course.currency)}
                </div>
                <Button size="lg" className="mt-2" onClick={handleBuyCourse}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Koop deze cursus
                </Button>
              </div>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.modules.length} modules
              </div>
              {course.studentsCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.studentsCount} studenten
                </div>
              )}
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  {course.rating}/5
                </div>
              )}
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Course Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="outcomes">Wat je leert</TabsTrigger>
          <TabsTrigger value="efficiency">ROI & Efficiency</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Over deze cursus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Target Audience */}
          {course.targetAudience && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Voor wie is deze cursus?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {course.targetAudience}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Vereisten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursusinhoud</CardTitle>
              <CardDescription>
                {course.previewLessons?.length || 0} gratis preview lessen beschikbaar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {module.description}
                      </p>
                    )}
                    {module.lessons && module.lessons.length > 0 ? (
                      <ul className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isPreviewable = isLessonPreviewable(lesson.id)
                          return (
                            <li
                              key={lesson.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-md",
                                isPreviewable
                                  ? "hover:bg-muted cursor-pointer"
                                  : "opacity-60"
                              )}
                              onClick={() => isPreviewable && handleViewLesson(lesson.id)}
                            >
                              <div className="flex items-center gap-3">
                                {isPreviewable ? (
                                  <Eye className="h-4 w-4 text-primary" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">
                                  Les {lessonIndex + 1}: {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.duration}
                                  </span>
                                )}
                                {isPreviewable && (
                                  <Badge variant="secondary" className="text-xs">
                                    Gratis preview
                                  </Badge>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Lesinhoud wordt binnenkort toegevoegd
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Outcomes Tab */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Wat je zult leren
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                <ul className="space-y-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Leerresultaten worden binnenkort toegevoegd.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-4">
          {course.efficiencyGains && (
            <Card>
              <CardHeader>
                <CardTitle>Return on Investment</CardTitle>
                <CardDescription>
                  Wat deze cursus je oplevert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.efficiencyGains.timePerWeek && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        Tijdsbesparing
                      </div>
                      <p className="text-2xl font-bold">{course.efficiencyGains.timePerWeek}</p>
                    </div>
                  )}
                  {course.efficiencyGains.costSavings && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Kostenbesparing
                      </div>
                      <p className="text-2xl font-bold">{course.efficiencyGains.costSavings}</p>
                    </div>
                  )}
                  {course.efficiencyGains.productivityBoost && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Productiviteitsboost
                      </div>
                      <p className="text-2xl font-bold">{course.efficiencyGains.productivityBoost}</p>
                    </div>
                  )}
                  {course.efficiencyGains.roi && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Trophy className="h-4 w-4 text-primary" />
                        ROI
                      </div>
                      <p className="text-2xl font-bold">{course.efficiencyGains.roi}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">
              Klaar om te beginnen?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Krijg direct toegang tot alle lessen, opdrachten en bronnen. 
              Start vandaag nog met het ontwikkelen van je AI-vaardigheden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-3xl font-bold">
                {formatPrice(course.price, course.currency)}
              </div>
              <Button size="lg" onClick={handleBuyCourse}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Koop deze cursus nu
              </Button>
            </div>
            {course.studentsCount && course.studentsCount > 100 && (
              <p className="text-sm text-muted-foreground">
                Sluit je aan bij {course.studentsCount} andere studenten!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}