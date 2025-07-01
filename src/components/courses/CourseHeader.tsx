'use client'

import { CourseData } from '@/lib/data/courses'
import { Button } from '@/components/ui/button'
import { LevelBadge } from './LevelBadge'
import { InstructorBadge } from '@/components/ui/InstructorBadge'
import { Clock, Users, Star, BookOpen, PlayCircle, Award, ArrowLeft, ShoppingCart, Loader2, Gift } from 'lucide-react'
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useEffect, useState } from 'react'
import { isUserEnrolled } from '@/services/paymentService'
import { toast } from '@/components/ui/use-toast'
import { referralService } from '@/services/referralService'

interface CourseHeaderProps {
  course: CourseData
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const [checkingFreeTrial, setCheckingFreeTrial] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user) {
        try {
          const isEnrolled = await isUserEnrolled(user.uid, course.id);
          setEnrolled(isEnrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        }
      }
      setCheckingEnrollment(false);
    };

    checkEnrollment();
  }, [user, course.id]);

  useEffect(() => {
    const checkFreeTrial = async () => {
      if (user && !enrolled) {
        try {
          const referralData = await referralService.getUserReferralStats(user.uid, user.email || '');
          const hasAvailableFreeTrial = referralData.activeRewards.some(
            (reward: any) => reward.type === 'free_lesson' && !reward.usedAt
          );
          setHasFreeTrial(hasAvailableFreeTrial);
        } catch (error) {
          console.error('Error checking free trial:', error);
        }
      }
      setCheckingFreeTrial(false);
    };

    checkFreeTrial();
  }, [user, enrolled]);

  const handlePurchaseClick = () => {
    if (!user) {
      toast({
        title: 'Login vereist',
        description: 'Je moet ingelogd zijn om een cursus te kopen',
      });
      router.push(`/login?redirect=/cursussen/${course.id}`);
      return;
    }

    router.push(`/checkout?courseId=${course.id}`);
  };

  const handleStartCourse = () => {
    // Navigate to the first lesson of the course
    if (course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      router.push(`/cursussen/${course.id}/lesson/${course.modules[0].lessons[0].id}`);
    } else {
      toast({
        title: 'Geen lessen beschikbaar',
        description: 'Deze cursus heeft nog geen lessen',
        variant: 'destructive'
      });
    }
  };

  const handleUseFreeTrial = async () => {
    if (!user) {
      toast({
        title: 'Login vereist',
        description: 'Je moet ingelogd zijn om je gratis proefles te gebruiken',
      });
      router.push(`/login?redirect=/cursussen/${course.id}`);
      return;
    }

    try {
      const result = await referralService.useFreeLesson(user.uid, course.id, user.email || '');
      if (result.success) {
        toast({
          title: 'Succes!',
          description: 'Je hebt nu toegang tot de eerste les van deze cursus',
        });
        // Refresh enrollment status
        setEnrolled(true);
        handleStartCourse();
      } else {
        toast({
          title: 'Fout',
          description: result.error || 'Kon gratis proefles niet activeren',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-blue-100 mb-4">
          <Link href="/cursussen" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Alle cursussen
          </Link>
          <span>/</span>
          <span>{course.category}</span>
        </div>

        {/* Main Header Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start gap-4">
              <h1 className="text-3xl md:text-4xl font-bold flex-1">
                {course.title}
              </h1>
              <LevelBadge level={course.level} className="bg-white/20 text-white border-white/30" />
            </div>

            <p className="text-lg text-blue-50 max-w-3xl">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-100">Instructor:</p>
              <InstructorBadge name={course.instructor} size="md" />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-200" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-200" />
                <span>{course.modules.length} modules</span>
              </div>
              {course.studentsCount && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-200" />
                  <span><ClientFormattedNumber value={course.studentsCount} /> studenten</span>
                </div>
              )}
              {course.rating && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Learning Outcomes */}
            <div className="pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Wat je gaat leren:
              </h3>
              <ul className="grid md:grid-cols-2 gap-2">
                {course.learningOutcomes.slice(0, 4).map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-sm text-blue-50">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <p className="text-blue-100 text-sm">Prijs</p>
                  <p className="text-3xl font-bold">€{course.price}</p>
                  <p className="text-sm text-blue-100">Eenmalig, levenslange toegang</p>
                </div>

                {/* ROI Box */}
                {course.efficiencyGains && (
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                    <h4 className="font-semibold text-green-100 mb-2">ROI & Efficiency</h4>
                    <ul className="space-y-1 text-sm">
                      {course.efficiencyGains.timePerWeek && (
                        <li>⏱️ {course.efficiencyGains.timePerWeek}</li>
                      )}
                      {course.efficiencyGains.costSavings && (
                        <li>💰 {course.efficiencyGains.costSavings}</li>
                      )}
                      {course.efficiencyGains.roi && (
                        <li className="font-semibold">📈 {course.efficiencyGains.roi}</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-2">
                  {checkingEnrollment || checkingFreeTrial ? (
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50" size="lg" disabled>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Laden...
                    </Button>
                  ) : enrolled ? (
                    <Button 
                      className="w-full bg-white text-blue-600 hover:bg-blue-50" 
                      size="lg"
                      onClick={handleStartCourse}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Start cursus
                    </Button>
                  ) : (
                    <>
                      {hasFreeTrial && (
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" 
                          size="lg"
                          onClick={handleUseFreeTrial}
                        >
                          <Gift className="w-5 h-5 mr-2" />
                          Gebruik Gratis Proefles
                        </Button>
                      )}
                      <Button 
                        className="w-full bg-white text-blue-600 hover:bg-blue-50" 
                        size="lg"
                        onClick={handlePurchaseClick}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Koop cursus
                      </Button>
                    </>
                  )}
                  <Button asChild variant="outline" className="w-full bg-transparent text-white border-white hover:bg-white hover:text-blue-600 transition-all">
                    <Link href={`?preview=true`}>
                      Preview bekijken
                    </Link>
                  </Button>
                </div>

                {/* Features */}
                <ul className="space-y-2 text-sm pt-4 border-t border-white/20">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Certificaat bij voltooiing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Praktische opdrachten
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    30 dagen geld terug garantie
                  </li>
                  {course.enableIDE && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      In-browser code editor
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}