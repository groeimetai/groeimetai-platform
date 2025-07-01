'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthProvider';
import { ObjectiveDashboard } from '../../components/objectives';
import { courseService } from '../../services/courseService';

export default function DoelstellingenPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [availableCourses, setAvailableCourses] = useState<{ id: string; title: string }[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await courseService.getAllCourses();
        setAvailableCourses(courses.map(c => ({ id: c.id, title: c.title })));
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (user) {
      loadCourses();
    }
  }, [user]);

  if (authLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ObjectiveDashboard 
        userId={user.uid} 
        availableCourses={availableCourses}
      />
    </div>
  );
}