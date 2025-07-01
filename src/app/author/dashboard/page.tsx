'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber';
import { 
  getAuthorById, 
  getAuthorCourses, 
  calculateAuthorRevenue 
} from '@/services/authorService';
import { courseService } from '@/services/courseService';
import { Author } from '@/types';
import { 
  PlusCircle, 
  BarChart3, 
  Users, 
  Euro, 
  TrendingUp, 
  BookOpen,
  Settings,
  Wallet,
  Clock,
  Star
} from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  pendingPayouts: number;
  averageRating: number;
  completionRate: number;
}

export default function AuthorDashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [author, setAuthor] = useState<Author | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    averageRating: 0,
    completionRate: 0
  });
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile && userProfile.role !== 'instructor' && userProfile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && userProfile) {
      loadAuthorData();
    }
  }, [user, userProfile, loading, router]);

  const loadAuthorData = async () => {
    try {
      setIsLoading(true);
      
      // Get author profile linked to user
      const authors = await courseService.getAuthorsByUserId(user!.uid);
      if (authors.length === 0) {
        // No author profile yet, redirect to apply
        router.push('/author/apply');
        return;
      }

      const authorData = authors[0];
      setAuthor(authorData);

      // Load courses
      const authorCourses = await getAuthorCourses(authorData.id);
      setCourses(authorCourses);

      // Calculate revenue
      const revenue = await calculateAuthorRevenue(authorData.id);
      setRevenueData(revenue);

      // Calculate stats
      const totalStudents = authorCourses.reduce((sum, course) => sum + (course.studentsCount || 0), 0);
      const avgRating = authorCourses.reduce((sum, course, _, arr) => {
        return sum + (course.rating || 0) / arr.length;
      }, 0);

      setStats({
        totalCourses: authorCourses.length,
        totalStudents: totalStudents,
        totalRevenue: revenue.totalRevenue,
        pendingPayouts: revenue.totalRevenue * 0.1, // Example: 10% pending
        averageRating: avgRating,
        completionRate: 75 // Example static value
      });

    } catch (error) {
      console.error('Error loading author data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!author) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Author Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {author.name}! Manage your courses and track your earnings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ClientFormattedNumber value={stats.totalStudents} />
            </div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €<ClientFormattedNumber value={stats.totalRevenue} />
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {stats.totalStudents} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="students">Student Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Courses</h2>
            <Button onClick={() => router.push('/author/courses/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </div>

          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.shortDescription}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.studentsCount || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {course.rating || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={course.isPublished ? "success" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/author/courses/${course.id}/edit`)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {courses.length === 0 && (
            <Alert>
              <AlertDescription>
                You haven't created any courses yet. Click "Create New Course" to get started!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Track your earnings and platform fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      €<ClientFormattedNumber value={revenueData?.totalRevenue || 0} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fee ({100 - author.revenueSharePercentage}%)</p>
                    <p className="text-2xl font-bold">
                      €<ClientFormattedNumber value={(revenueData?.totalRevenue || 0) * (1 - author.revenueSharePercentage / 100)} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      €<ClientFormattedNumber value={(revenueData?.totalRevenue || 0) * (author.revenueSharePercentage / 100)} />
                    </p>
                  </div>
                </div>

                {revenueData?.courseBreakdown && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">Revenue by Course</h4>
                    <div className="space-y-2">
                      {revenueData.courseBreakdown.map((course: any) => (
                        <div key={course.courseId} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{course.courseName}</span>
                          <span className="text-green-600 font-semibold">
                            €<ClientFormattedNumber value={course.authorRevenue} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Analytics Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Track student engagement and course performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Enrollment Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Enrollments</span>
                      <span className="font-medium">{stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Students</span>
                      <span className="font-medium">{Math.floor(stats.totalStudents * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{stats.completionRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Course Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <span className="font-medium">{stats.averageRating.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Review Count</span>
                      <span className="font-medium">{Math.floor(stats.totalStudents * 0.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Watch Time</span>
                      <span className="font-medium">67%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>
                Manage your earnings and withdrawal settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      €<ClientFormattedNumber value={stats.pendingPayouts} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payout Date</p>
                    <p className="text-2xl font-bold">March 1, 2024</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full md:w-auto"
                    onClick={() => router.push('/author/payouts')}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Manage Payout Settings
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    Payouts are processed monthly. Minimum payout amount is €50.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}