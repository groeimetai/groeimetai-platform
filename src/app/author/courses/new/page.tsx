'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { CourseUpload } from '@/components/author';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewCoursePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile && userProfile.role !== 'instructor' && userProfile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (userProfile && userProfile.role !== 'instructor' && userProfile.role !== 'admin')) {
    return null;
  }

  const handleSave = (courseId: string) => {
    router.push(`/author/courses/${courseId}/edit`);
  };

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
        
        <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create your new course. You can save as draft and publish later.
        </p>
      </div>

      <CourseUpload onSave={handleSave} />
    </div>
  );
}