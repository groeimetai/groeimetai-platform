'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { CourseUpload } from '@/components/author';
import { courseService } from '@/services/courseService';
import { Course } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile && userProfile.role !== 'instructor' && userProfile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && params.id) {
      loadCourse();
    }
  }, [user, userProfile, loading, params.id, router]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const courseData = await courseService.getCourseById(params.id);
      
      if (!courseData) {
        setError('Course not found');
        return;
      }

      // Check if user is the instructor or admin
      if (userProfile?.role !== 'admin' && courseData.instructorId !== user?.uid) {
        setError('You do not have permission to edit this course');
        return;
      }

      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    router.push('/author/dashboard');
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/author/dashboard')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/author/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
        <p className="text-muted-foreground">
          Update your course details, add new lessons, or change publishing settings.
        </p>
      </div>

      <CourseUpload 
        initialData={course} 
        courseId={params.id}
        onSave={handleSave} 
      />
    </div>
  );
}