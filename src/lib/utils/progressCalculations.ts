import { Enrollment, Progress, Lesson, Course } from '@/types';

/**
 * Calculate overall progress across all enrollments
 */
export function calculateOverallProgress(enrollments: Enrollment[]): number {
  if (enrollments.length === 0) return 0;

  const totalProgress = enrollments.reduce((acc, enrollment) => {
    return acc + enrollment.progress;
  }, 0);

  return Math.round(totalProgress / enrollments.length);
}

/**
 * Calculate time to complete based on progress and estimated duration
 */
export function calculateTimeToComplete(
  progress: number,
  totalDuration: number,
  averagePace: number = 1
): number {
  if (progress >= 100) return 0;

  const remainingPercentage = (100 - progress) / 100;
  const remainingDuration = totalDuration * remainingPercentage;
  
  // Adjust based on learning pace (1 = normal, >1 = slower, <1 = faster)
  return Math.round(remainingDuration * averagePace);
}

/**
 * Calculate learning velocity (progress per day)
 */
export function calculateLearningVelocity(
  enrollment: Enrollment,
  currentDate: Date = new Date()
): number {
  const enrollmentDate = new Date(enrollment.enrolledAt);
  const daysSinceEnrollment = Math.max(
    1,
    Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  return enrollment.progress / daysSinceEnrollment;
}

/**
 * Calculate estimated completion date
 */
export function calculateEstimatedCompletionDate(
  enrollment: Enrollment,
  velocity?: number
): Date | null {
  if (enrollment.progress >= 100 || enrollment.completedAt) {
    return enrollment.completedAt ? new Date(enrollment.completedAt) : null;
  }

  const currentVelocity = velocity || calculateLearningVelocity(enrollment);
  
  if (currentVelocity === 0) return null;

  const remainingProgress = 100 - enrollment.progress;
  const daysToComplete = Math.ceil(remainingProgress / currentVelocity);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);
  
  return completionDate;
}

/**
 * Calculate progress statistics for a set of enrollments
 */
export function calculateProgressStatistics(enrollments: Enrollment[]) {
  const stats = {
    total: enrollments.length,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    averageProgress: 0,
    totalLessonsCompleted: 0,
    completionRate: 0
  };

  enrollments.forEach(enrollment => {
    if (enrollment.completedAt) {
      stats.completed++;
    } else if (enrollment.progress > 0) {
      stats.inProgress++;
    } else {
      stats.notStarted++;
    }

    stats.averageProgress += enrollment.progress;
    stats.totalLessonsCompleted += enrollment.completedLessons.length;
  });

  stats.averageProgress = enrollments.length > 0 
    ? Math.round(stats.averageProgress / enrollments.length)
    : 0;
    
  stats.completionRate = enrollments.length > 0
    ? Math.round((stats.completed / enrollments.length) * 100)
    : 0;

  return stats;
}

/**
 * Calculate weekly progress
 */
export function calculateWeeklyProgress(
  enrollments: Enrollment[],
  weeks: number = 4
): Array<{ week: string; progress: number }> {
  const weeklyData: Array<{ week: string; progress: number }> = [];
  const currentDate = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(currentDate.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    let weekProgress = 0;
    let courseCount = 0;

    enrollments.forEach(enrollment => {
      const enrollmentDate = new Date(enrollment.enrolledAt);
      
      // Only count enrollments that existed during this week
      if (enrollmentDate <= weekEnd) {
        // For simplicity, we'll use current progress
        // In a real app, you'd track historical progress data
        weekProgress += enrollment.progress;
        courseCount++;
      }
    });

    const averageProgress = courseCount > 0 ? weekProgress / courseCount : 0;

    weeklyData.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: Math.round(averageProgress)
    });
  }

  return weeklyData;
}

/**
 * Calculate learning pace category
 */
export function calculateLearningPace(velocity: number): {
  category: 'fast' | 'normal' | 'slow';
  description: string;
  color: string;
} {
  if (velocity >= 5) {
    return {
      category: 'fast',
      description: 'Fast learner - Great pace!',
      color: 'text-green-600'
    };
  } else if (velocity >= 2) {
    return {
      category: 'normal',
      description: 'Steady progress - Keep it up!',
      color: 'text-blue-600'
    };
  } else {
    return {
      category: 'slow',
      description: 'Taking your time - Stay consistent!',
      color: 'text-orange-600'
    };
  }
}

/**
 * Calculate course difficulty based on completion rates
 */
export function calculateCourseDifficulty(
  courseId: string,
  allEnrollments: Enrollment[]
): {
  difficulty: 'easy' | 'medium' | 'hard';
  completionRate: number;
} {
  const courseEnrollments = allEnrollments.filter(e => e.courseId === courseId);
  
  if (courseEnrollments.length === 0) {
    return { difficulty: 'medium', completionRate: 0 };
  }

  const completedCount = courseEnrollments.filter(e => e.completedAt).length;
  const completionRate = (completedCount / courseEnrollments.length) * 100;

  let difficulty: 'easy' | 'medium' | 'hard';
  
  if (completionRate >= 80) {
    difficulty = 'easy';
  } else if (completionRate >= 50) {
    difficulty = 'medium';
  } else {
    difficulty = 'hard';
  }

  return { difficulty, completionRate: Math.round(completionRate) };
}

/**
 * Calculate next milestone
 */
export function calculateNextMilestone(progress: number): {
  milestone: number;
  remaining: number;
  label: string;
} {
  const milestones = [
    { value: 25, label: 'Quarter Complete' },
    { value: 50, label: 'Halfway There' },
    { value: 75, label: 'Three Quarters' },
    { value: 100, label: 'Course Complete' }
  ];

  const nextMilestone = milestones.find(m => m.value > progress) || milestones[milestones.length - 1];

  return {
    milestone: nextMilestone.value,
    remaining: Math.max(0, nextMilestone.value - progress),
    label: nextMilestone.label
  };
}