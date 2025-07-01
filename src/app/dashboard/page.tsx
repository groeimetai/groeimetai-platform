'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Play,
  Award,
  Target,
  Flame,
  Shield,
  ExternalLink
} from 'lucide-react';
import { EnrolledCoursesWidget } from '@/components/dashboard/EnrolledCoursesWidget';
import { ProgressOverviewWidget } from '@/components/dashboard/ProgressOverviewWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { UpcomingLessons } from '@/components/dashboard/UpcomingLessons';
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget';
import { LearningStreakWidget } from '@/components/dashboard/LearningStreakWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CertificateGenerator } from '@/components/dashboard/CertificateGenerator';
import { BlockchainCertificatesWidget } from '@/components/dashboard/BlockchainCertificatesWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { 
    enrollments, 
    certificates, 
    recentActivity, 
    learningStreak,
    statistics,
    loading: dataLoading,
    error,
    refresh
  } = useDashboardData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
            <Button onClick={refresh} className="w-full mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.photoURL || undefined} />
                <AvatarFallback>
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userProfile.displayName || 'Student'}!
                </h1>
                <p className="text-gray-600">
                  {statistics.activeCourses > 0 
                    ? `You have ${statistics.activeCourses} active ${statistics.activeCourses === 1 ? 'course' : 'courses'}`
                    : 'Ready to start learning?'}
                </p>
              </div>
            </div>
            <LearningStreakWidget streak={learningStreak} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Courses Enrolled</p>
                    <p className="text-2xl font-bold">{statistics.totalCourses}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{statistics.completedCourses}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold">{certificates.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Study Time</p>
                    <p className="text-2xl font-bold">{statistics.totalHours}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Generator Alert */}
        <CertificateGenerator />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActions enrollments={enrollments} />

            {/* Progress Overview */}
            <ProgressOverviewWidget enrollments={enrollments} />

            <EnrolledCoursesWidget enrollments={enrollments} />

            {/* Achievements */}
            <AchievementsWidget certificates={certificates} />
            
            {/* Blockchain Certificates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle>Blockchain Certificates</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/blockchain')}
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>
                  Secure your achievements on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainCertificatesWidget certificates={certificates} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Lessons */}
            <UpcomingLessons enrollments={enrollments} />

            {/* Recent Activity */}
            <ActivityTimeline activities={recentActivity} />

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Study Goal</span>
                    <Badge variant="outline">10h / 15h</Badge>
                  </div>
                  <Progress value={66} className="h-2" />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/doelstellingen')}
                  >
                    Manage Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}