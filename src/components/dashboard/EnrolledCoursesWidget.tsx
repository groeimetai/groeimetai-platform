
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { BookOpen, Play, Award } from "lucide-react";
import { Certificate } from "@/types/certificate";

interface EnrollmentWithCourse {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  course?: {
    title: string;
  };
}

interface EnrolledCoursesWidgetProps {
  enrollments: EnrollmentWithCourse[];
  certificates?: Certificate[];
}

export const EnrolledCoursesWidget = ({ enrollments, certificates = [] }: EnrolledCoursesWidgetProps) => {
  const router = useRouter();

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are not enrolled in any courses yet.</p>
          <Button onClick={() => router.push('/cursussen')} className="mt-4">
            Explore Courses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Courses</span>
          <Button variant="ghost" size="sm" onClick={() => router.push('/cursussen')}>View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollments.filter(e => e.course).slice(0, 3).map((enrollment) => {
            // Check if there's a certificate for this completed course
            const certificate = certificates.find(cert => 
              cert.courseId === enrollment.courseId && 
              cert.userId === enrollment.userId
            );
            const isCompleted = enrollment.progress === 100;

            return (
              <div key={enrollment.id} className="flex items-center p-2 rounded-lg transition-colors hover:bg-gray-50">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-500" />
                </div>
                <div className="flex-grow ml-4">
                  <h3 className="font-semibold">{enrollment.course?.title}</h3>
                  <div className="flex items-center mt-1">
                    <Progress value={enrollment.progress || 0} className="w-full h-2" />
                    <span className="text-xs text-gray-500 ml-2">{enrollment.progress || 0}%</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {isCompleted && certificate ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/certificate/verify/${certificate.id}`)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Certificate
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/cursussen/${enrollment.courseId}`)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {isCompleted ? 'Review' : 'Continue'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
