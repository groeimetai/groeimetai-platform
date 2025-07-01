'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber';
import { 
  getAuthorById, 
  getAuthorCourses, 
  calculateAuthorRevenue 
} from '@/services/authorService';
import { courseService } from '@/services/courseService';
import { Author, Course } from '@/types';
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  BookOpen,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalStudents: number;
    averageRating: number;
    completionRate: number;
    totalCourses: number;
    totalLessons: number;
    totalHoursContent: number;
    engagementRate: number;
  };
  trends: {
    revenueByMonth: Array<{ month: string; revenue: number }>;
    enrollmentsByMonth: Array<{ month: string; enrollments: number }>;
    completionsByMonth: Array<{ month: string; completions: number }>;
  };
  coursePerformance: Array<{
    courseId: string;
    courseName: string;
    students: number;
    revenue: number;
    rating: number;
    completionRate: number;
  }>;
  studentDemographics: {
    byCountry: Array<{ country: string; count: number }>;
    byLevel: Array<{ level: string; count: number }>;
  };
}

export default function AuthorAnalyticsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [author, setAuthor] = useState<Author | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCourse, setSelectedCourse] = useState('all');
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
      loadAnalytics();
    }
  }, [user, userProfile, loading, router, timeRange, selectedCourse]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Get author profile
      const authors = await courseService.getAuthorsByUserId(user!.uid);
      if (authors.length === 0) {
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

      // Generate analytics data (mock data for demonstration)
      const analyticsData: AnalyticsData = {
        overview: {
          totalRevenue: revenue.totalRevenue,
          totalStudents: authorCourses.reduce((sum, course) => sum + (course.studentsCount || 0), 0),
          averageRating: authorCourses.reduce((sum, course, _, arr) => sum + (course.rating || 0) / arr.length, 0),
          completionRate: 72,
          totalCourses: authorCourses.length,
          totalLessons: authorCourses.reduce((sum, course) => sum + (course.lessonsCount || 0), 0),
          totalHoursContent: authorCourses.reduce((sum, course) => sum + (course.duration || 0) / 60, 0),
          engagementRate: 85
        },
        trends: {
          revenueByMonth: [
            { month: 'Jan', revenue: 2400 },
            { month: 'Feb', revenue: 2800 },
            { month: 'Mar', revenue: 3200 },
            { month: 'Apr', revenue: 2900 },
            { month: 'May', revenue: 3500 },
            { month: 'Jun', revenue: 4100 }
          ],
          enrollmentsByMonth: [
            { month: 'Jan', enrollments: 45 },
            { month: 'Feb', enrollments: 52 },
            { month: 'Mar', enrollments: 61 },
            { month: 'Apr', enrollments: 58 },
            { month: 'May', enrollments: 72 },
            { month: 'Jun', enrollments: 85 }
          ],
          completionsByMonth: [
            { month: 'Jan', completions: 32 },
            { month: 'Feb', completions: 38 },
            { month: 'Mar', completions: 44 },
            { month: 'Apr', completions: 41 },
            { month: 'May', completions: 52 },
            { month: 'Jun', completions: 61 }
          ]
        },
        coursePerformance: revenue.courseBreakdown.map(course => ({
          courseId: course.courseId,
          courseName: course.courseName,
          students: Math.floor(Math.random() * 200) + 50,
          revenue: course.authorRevenue,
          rating: 4 + Math.random(),
          completionRate: 60 + Math.random() * 30
        })),
        studentDemographics: {
          byCountry: [
            { country: 'Netherlands', count: 45 },
            { country: 'Belgium', count: 32 },
            { country: 'Germany', count: 28 },
            { country: 'France', count: 21 },
            { country: 'UK', count: 18 },
            { country: 'Other', count: 29 }
          ],
          byLevel: [
            { level: 'Beginner', count: 68 },
            { level: 'Intermediate', count: 72 },
            { level: 'Advanced', count: 33 }
          ]
        }
      };

      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading analytics:', error);
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

  if (!author || !analytics) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/author/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Detailed insights into your course performance and student engagement
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €<ClientFormattedNumber value={analytics.overview.totalRevenue} />
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last period
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
              <ClientFormattedNumber value={analytics.overview.totalStudents} />
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +22% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% from last period
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
              {analytics.overview.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {analytics.overview.totalStudents} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        {/* Revenue Trends */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Track your earnings trends and identify growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simplified chart representation */}
                <div className="h-64 flex items-end justify-between gap-2">
                  {analytics.trends.revenueByMonth.map((data) => {
                    const height = (data.revenue / 5000) * 100;
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs mt-2">{data.month}</span>
                        <span className="text-xs font-semibold">€{data.revenue}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average Monthly Revenue</p>
                    <p className="text-xl font-bold">€3,183</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Best Month</p>
                    <p className="text-xl font-bold">June (€4,100)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-xl font-bold text-green-600">+15.3%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Understand how students interact with your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Enrollments Over Time</h4>
                    <div className="h-48 flex items-end justify-between gap-1">
                      {analytics.trends.enrollmentsByMonth.map((data) => {
                        const height = (data.enrollments / 100) * 100;
                        return (
                          <div key={data.month} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors rounded-t"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-xs mt-1">{data.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-4">Key Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium">{analytics.overview.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Watch Time</span>
                        <span className="font-medium">67%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Return Rate</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quiz Pass Rate</span>
                        <span className="font-medium">82%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Performance */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Course Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of each course's metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.coursePerformance.map((course) => (
                  <div key={course.courseId} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{course.courseName}</h4>
                      <span className="text-sm text-muted-foreground">
                        €<ClientFormattedNumber value={course.revenue} />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students</span>
                        <p className="font-medium">{course.students}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating</span>
                        <p className="font-medium">{course.rating.toFixed(1)} ⭐</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion</span>
                        <p className="font-medium">{course.completionRate.toFixed(0)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue/Student</span>
                        <p className="font-medium">
                          €{(course.revenue / course.students).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Students by Country</CardTitle>
                <CardDescription>
                  Geographic distribution of your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.studentDemographics.byCountry.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <span className="text-sm">{country.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(country.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{country.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students by Level</CardTitle>
                <CardDescription>
                  Distribution across difficulty levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.studentDemographics.byLevel.map((level) => (
                    <div key={level.level} className="flex items-center justify-between">
                      <span className="text-sm">{level.level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(level.count / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{level.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Additional Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Age</span>
                      <span className="font-medium">28 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile Users</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred Language</span>
                      <span className="font-medium">Dutch (67%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}