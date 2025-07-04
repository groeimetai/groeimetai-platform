'use client'

import { useState, useEffect, useMemo } from 'react'
import { CourseData, CourseModule, Lesson } from '@/lib/data/courses'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useVideoProgress } from '@/hooks/useVideoProgress'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Code, PlayCircle } from 'lucide-react'
import { getCourseWithContent } from '@/lib/data/course-loader';
import { CourseSidebar } from './CourseSidebar'
import { LessonViewer } from './LessonViewer'
import { CourseCompletionModal } from './CourseCompletionModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EnrollmentService } from '@/services/enrollmentService'
import { CertificateService } from '@/services/certificateService'
import { Certificate } from '@/types'

// Sub-component that renders the actual course content when data is ready
function CourseContentView({ course, enrolled }: { course: CourseData, enrolled: boolean }) {
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false)
  const [hasCheckedCompletion, setHasCheckedCompletion] = useState(false)
  const courseModules = useMemo(() => {
    // Ensure modules is always an array
    const modules = course.modules;
    
    // Extra safety check
    if (!modules || !Array.isArray(modules)) {
      console.error('Course modules is not an array:', modules);
      return [];
    }
    
    if (enrolled) {
      return modules;
    }
    
    // Check if filter function exists (extra safety)
    if (typeof modules.filter !== 'function') {
      console.error('modules.filter is not a function, modules is:', modules);
      return [];
    }
    
    return modules.filter(m => m.isPreview);
  }, [course.modules, enrolled]);

  const [currentModuleId, setCurrentModuleId] = useState<string>(courseModules[0]?.id || '');
  const [currentLessonId, setCurrentLessonId] = useState<string>(courseModules[0]?.lessons[0]?.id || '');
  
  const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>(
    `course-${course.id}-completed`,
    []
  );
  const [savedCode, setSavedCode] = useLocalStorage<Record<string, string>>(
    `course-${course.id}-code`,
    {}
  );

  const { user } = useAuth();
  const { saveProgress, getCourseProgress } = useVideoProgress();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (courseModules.length > 0 && !currentModuleId && !currentLessonId) {
      const firstModule = courseModules[0];
      const firstLesson = firstModule.lessons?.[0];
      if (firstLesson) {
        setCurrentModuleId(firstModule.id);
        setCurrentLessonId(firstLesson.id);
      }
    }
  }, [courseModules, currentModuleId, currentLessonId]);

  const currentModule = useMemo(() => courseModules.find(m => m.id === currentModuleId), [courseModules, currentModuleId]);
  const currentLesson = useMemo(() => currentModule?.lessons.find(l => l.id === currentLessonId), [currentModule, currentLessonId]);

  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
  };

  const markLessonComplete = async () => {
    if (currentLessonId && !completedLessons.includes(currentLessonId)) {
      const newCompletedLessons = [...completedLessons, currentLessonId];
      setCompletedLessons(newCompletedLessons);
      if (user) {
        // Save video progress
        await saveProgress(course.id, currentLessonId, 0, 100, true);
        
        // Update enrollment with completed lesson
        try {
          const enrollment = await EnrollmentService.getUserEnrollment(user.uid, course.id);
          if (enrollment) {
            // Update completed lessons in enrollment
            await EnrollmentService.markLessonCompleted(enrollment.id, currentLessonId);
            
            // Calculate and update overall progress
            const allLessonIds = courseModules.flatMap(m => m.lessons.map(l => l.id));
            const progress = Math.round((newCompletedLessons.length / allLessonIds.length) * 100);
            await EnrollmentService.updateEnrollmentProgress(enrollment.id, progress, currentLessonId);
          }
        } catch (error) {
          console.error('Error updating enrollment progress:', error);
        }
        
        // Check if course is now complete (this is a new completion)
        checkCourseCompletion(newCompletedLessons, true);
      }
    }
  };

  const checkCourseCompletion = async (currentCompletedLessons: string[], isNewCompletion = false) => {
    // Get all lesson IDs from all modules
    const allLessonIds = courseModules.flatMap(module => 
      module.lessons.map(lesson => lesson.id)
    );
    
    // Check if all lessons are completed
    const isComplete = allLessonIds.every(lessonId => 
      currentCompletedLessons.includes(lessonId)
    );
    
    // Only trigger course completion if:
    // 1. All lessons are complete AND
    // 2. This is a new completion (user just completed a lesson) OR we haven't checked completion yet
    // 3. User is authenticated
    if (isComplete && isNewCompletion && !hasCheckedCompletion && user) {
      setHasCheckedCompletion(true);
      
      // Update enrollment status first
      await EnrollmentService.completeEnrollment(user.uid, course.id);
      
      // Check if certificate already exists
      const existingCertificate = await CertificateService.getUserCourseCertificate(user.uid, course.id);
      if (existingCertificate) {
        setCertificate(existingCertificate);
      } else {
        // Automatically generate certificate for course completion
        try {
          const certificateId = await CertificateService.generateCertificateForCourseCompletion(
            user.uid,
            course.id
          );
          
          if (certificateId) {
            const newCertificate = await CertificateService.getCertificateById(certificateId);
            if (newCertificate) {
              setCertificate(newCertificate);
            }
          }
        } catch (error) {
          console.error('Error auto-generating certificate:', error);
        }
      }
      
      // Show completion modal
      setShowCompletionModal(true);
    }
  };

  const generateCertificate = async () => {
    if (!user) return;
    
    setIsGeneratingCertificate(true);
    try {
      const certificateId = await CertificateService.generateCertificate({
        userId: user.uid,
        courseId: course.id,
        studentName: user.displayName || 'Student',
        courseName: course.title,
        instructorName: course.instructor?.displayName || 'Instructor',
        instructorTitle: 'Course Instructor',
        score: 100, // You can calculate actual score if needed
        grade: 'A',
        completionTime: completedLessons.length * 30, // Estimate based on lessons
        achievements: ['Course Completed', 'All Lessons Viewed'],
      });
      
      if (certificateId) {
        const newCertificate = await CertificateService.getCertificateById(certificateId);
        if (newCertificate) {
          setCertificate(newCertificate);
        }
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleCodeSave = (assignmentId: string, code: string) => {
    setSavedCode({
      ...savedCode,
      [assignmentId]: code
    });
  };

  const getNextLesson = () => {
    if (!currentModule || !currentLesson) return null;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        moduleId: currentModuleId,
        lessonId: currentModule.lessons[currentLessonIndex + 1].id
      };
    }

    const currentModuleIndex = courseModules.findIndex(m => m.id === currentModuleId);
    if (currentModuleIndex < courseModules.length - 1) {
      const nextModule = courseModules[currentModuleIndex + 1];
      return {
        moduleId: nextModule.id,
        lessonId: nextModule.lessons[0]?.id
      };
    }
    return null;
  };

  const handleNextLesson = () => {
    const next = getNextLesson();
    if (next) {
      handleLessonSelect(next.moduleId, next.lessonId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isPreview) {
      const firstPreviewModule = courseModules.find(m => m.isPreview);
      if (firstPreviewModule) {
        const firstPreviewLesson = firstPreviewModule.lessons.find(l => l.isPreview);
        if (firstPreviewLesson) {
          handleLessonSelect(firstPreviewModule.id, firstPreviewLesson.id);
        }
      }
    }
  }, [isPreview, courseModules]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      // First, check if user already has a certificate for this course
      try {
        const existingCertificate = await CertificateService.getUserCourseCertificate(user.uid, course.id);
        if (existingCertificate) {
          setCertificate(existingCertificate);
          setHasCheckedCompletion(true); // Prevent duplicate checks
        }
      } catch (error) {
        console.error('Error checking for existing certificate:', error);
      }
      
      const courseProgress = await getCourseProgress(course.id);
      const completedFromDb = courseProgress
        .filter(p => p.completed)
        .map(p => p.lessonId);
      
      if (completedFromDb.length > 0) {
        const updatedCompletedLessons = [...new Set([...completedLessons, ...completedFromDb])];
        setCompletedLessons(updatedCompletedLessons);
        
        // Sync video progress to enrollment for existing data
        try {
          const enrollment = await EnrollmentService.getUserEnrollment(user.uid, course.id);
          if (enrollment) {
            // Check if enrollment needs updating
            const needsUpdate = completedFromDb.some(lessonId => 
              !enrollment.completedLessons?.includes(lessonId)
            );
            
            if (needsUpdate) {
              console.log('Syncing video progress to enrollment...');
              // Update enrollment with all completed lessons
              for (const lessonId of completedFromDb) {
                if (!enrollment.completedLessons?.includes(lessonId)) {
                  await EnrollmentService.markLessonCompleted(enrollment.id, lessonId);
                }
              }
              
              // Update overall progress
              const allLessonIds = courseModules.flatMap(m => m.lessons.map(l => l.id));
              const progress = Math.round((updatedCompletedLessons.length / allLessonIds.length) * 100);
              await EnrollmentService.updateEnrollmentProgress(enrollment.id, progress, null);
            }
          }
        } catch (error) {
          console.error('Error syncing progress to enrollment:', error);
        }
        
        // Check if course is already completed
        // Pass false for isNewCompletion since we're just loading existing progress
        await checkCourseCompletion(updatedCompletedLessons, false);
      }
    };
    loadProgress();
  }, [user, course.id, getCourseProgress]);

  if (courseModules.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Deze cursus heeft nog geen modules beschikbaar.</p>
          {!enrolled && (
            <p className="text-sm text-gray-400">Schrijf je in om toegang te krijgen tot alle cursusinhoud.</p>
          )}
        </div>
      </div>
    );
  }

  if (!currentLesson || !currentModule) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Selecteer een les om te beginnen.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <CourseSidebar
          course={{ ...course, modules: courseModules }}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          completedLessons={completedLessons}
        />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Module {courseModules.findIndex(m => m.id === currentModuleId) + 1} - {currentModule.title}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentLesson.title}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  {currentLesson.duration}
                </span>
                {currentLesson.assignments && currentLesson.assignments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    {currentLesson.assignments.length} opdracht{currentLesson.assignments.length !== 1 ? 'en' : ''}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={markLessonComplete}
              variant={completedLessons.includes(currentLessonId) ? "outline" : "default"}
              disabled={completedLessons.includes(currentLessonId)}
            >
              {completedLessons.includes(currentLessonId) ? '✓ Voltooid' : 'Markeer als voltooid'}
            </Button>
          </div>
        </Card>

        <LessonViewer 
          lesson={currentLesson}
          savedCode={savedCode}
          onCodeSave={handleCodeSave}
          courseId={course.id}
        />

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              {completedLessons.includes(currentLessonId) ? (
                <p className="text-green-600 font-medium">✓ Les voltooid!</p>
              ) : (
                <p className="text-gray-600">Markeer deze les als voltooid om door te gaan</p>
              )}
            </div>
            <div className="flex gap-2">
              {getNextLesson() && (
                <Button
                  onClick={handleNextLesson}
                  disabled={!completedLessons.includes(currentLessonId)}
                >
                  Volgende les →
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
    
    <CourseCompletionModal
      isOpen={showCompletionModal}
      onClose={() => setShowCompletionModal(false)}
      courseName={course.title}
      courseId={course.id}
      certificate={certificate || undefined}
      onGenerateCertificate={generateCertificate}
      isGeneratingCertificate={isGeneratingCertificate}
    />
  </>
  );
}

// Main component responsible for fetching data and handling states
export function CourseViewer({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseWithContent(courseId);
        if (courseData) {
          setCourse(courseData);
        } else {
          setError('Cursus niet gevonden');
        }
      } catch (err) {
        console.error("Fout bij het ophalen van de cursus:", err);
        setError('Fout bij het ophalen van de cursus');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && course) {
        try {
          const isEnrolled = await EnrollmentService.hasAccessToCourse(user.uid, course.id);
          setEnrolled(isEnrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
          // Optionally set an error state here
        } finally {
          setCheckingEnrollment(false);
        }
      } else {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, course]);

  if (loading || checkingEnrollment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cursus wordt geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cursus niet gevonden.</p>
      </div>
    );
  }

  return <CourseContentView course={course} enrolled={enrolled} />;
}
