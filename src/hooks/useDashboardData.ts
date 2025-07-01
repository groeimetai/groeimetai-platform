'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { EnrollmentService } from '@/services/enrollmentService';
import { CertificateService } from '@/services/certificateService';
import { Enrollment, Certificate } from '@/types';
import { Activity } from '@/components/dashboard/ActivityTimeline';

interface DashboardData {
  enrollments: Enrollment[];
  certificates: Certificate[];
  recentActivity: Activity[];
  learningStreak: {
    current: number;
    longest: number;
    lastActivityDate: Date | null;
    weeklyActivity: boolean[];
  };
  statistics: {
    totalCourses: number;
    completedCourses: number;
    activeCourses: number;
    totalHours: number;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [learningStreak, setLearningStreak] = useState({
    current: 0,
    longest: 0,
    lastActivityDate: null as Date | null,
    weeklyActivity: [false, false, false, false, false, false, false]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch enrollments
      const userEnrollments = await EnrollmentService.getUserEnrollments(user.uid);
      setEnrollments(userEnrollments);

      // Fetch certificates
      const userCertificates = await CertificateService.getUserCertificates(user.uid);
      setCertificates(userCertificates);

      // Generate recent activity from enrollments and certificates
      const activities = generateRecentActivity(userEnrollments, userCertificates);
      setRecentActivity(activities);

      // Calculate learning streak
      const streak = calculateLearningStreak(activities);
      setLearningStreak(streak);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const toDate = (timestamp: any): Date => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  const generateRecentActivity = (
    enrollments: Enrollment[], 
    certificates: Certificate[]
  ): Activity[] => {
    const activities: Activity[] = [];

    // Add enrollment activities
    if (enrollments) {
      enrollments.forEach(enrollment => {
        activities.push({
          id: `enroll-${enrollment.id}`,
          type: 'course_started',
          title: 'Started Course',
          description: 'Enrolled in a new course',
          timestamp: toDate(enrollment.enrolledAt),
          metadata: { courseId: enrollment.courseId }
        });

        // Add completion activity if completed
        if (enrollment.completedAt) {
          activities.push({
            id: `complete-${enrollment.id}`,
            type: 'course_completed',
            title: 'Course Completed',
            description: 'Successfully completed the course',
            timestamp: toDate(enrollment.completedAt),
            metadata: { courseId: enrollment.courseId }
          });
        }

        // Add lesson completion activities (simulated - in real app, track separately)
        if (enrollment.completedLessons && Array.isArray(enrollment.completedLessons)) {
          enrollment.completedLessons.forEach((lessonId, index) => {
            const lessonDate = new Date(enrollment.enrolledAt);
            lessonDate.setHours(lessonDate.getHours() + index * 24); // Simulate daily progress
            
            activities.push({
              id: `lesson-${enrollment.id}-${lessonId}`,
              type: 'lesson_completed',
              title: 'Lesson Completed',
              description: `Completed lesson ${index + 1}`,
              timestamp: lessonDate,
              metadata: { courseId: enrollment.courseId, lessonId }
            });
          });
        }
      });
    }

    // Add certificate activities
    if (certificates) {
      certificates.forEach(certificate => {
        activities.push({
          id: `cert-${certificate.id}`,
          type: 'certificate_earned',
          title: 'Certificate Earned',
          description: `Earned certificate for ${certificate.courseName}`,
          timestamp: toDate(certificate.completionDate),
          metadata: { certificateId: certificate.id }
        });
      });
    }

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const calculateLearningStreak = (activities: Activity[]) => {
    if (activities.length === 0) {
      return {
        current: 0,
        longest: 0,
        lastActivityDate: null,
        weeklyActivity: [false, false, false, false, false, false, false]
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = activities.map(a => {
      const date = new Date(a.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = Array.from(new Set(activityDates))
      .sort((a, b) => b - a)
      .map(timestamp => new Date(timestamp));

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (const activityDate of uniqueDates) {
      const diffDays = Math.floor((checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        currentStreak++;
        checkDate = new Date(activityDate);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const diffDays = Math.floor(
        (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Calculate weekly activity
    const weeklyActivity = [false, false, false, false, false, false, false];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
    oneWeekAgo.setHours(0, 0, 0, 0);

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= oneWeekAgo) {
        const dayIndex = (activityDate.getDay() + 6) % 7; // Monday = 0
        weeklyActivity[dayIndex] = true;
      }
    });

    return {
      current: currentStreak,
      longest: longestStreak,
      lastActivityDate: uniqueDates.length > 0 ? uniqueDates[0] : null,
      weeklyActivity
    };
  };

  const statistics = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.completedAt).length,
    activeCourses: enrollments.filter(e => !e.completedAt).length,
    totalHours: Math.round(
      enrollments.reduce((acc, enrollment) => {
        // Estimate based on progress (mock calculation)
        const estimatedHours = (enrollment.progress / 100) * 10; // Assume 10 hours per course
        return acc + estimatedHours;
      }, 0)
    )
  };

  return {
    enrollments,
    certificates,
    recentActivity,
    learningStreak,
    statistics,
    loading,
    error,
    refresh: fetchDashboardData
  };
}