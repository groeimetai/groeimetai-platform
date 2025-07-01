
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export const QuickActions = ({ enrollments }) => {
  const router = useRouter();
  const lastCourse = enrollments?.[0];

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">Continue where you left off</h3>
          {lastCourse && lastCourse.course ? (
            <p className="text-gray-600 text-sm">
              Jump back into <span className="font-medium">{lastCourse.course.title}</span>.
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              Start a new course today!
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastCourse && lastCourse.course && (
            <Button 
              onClick={() => router.push(`/cursussen/${lastCourse.courseId}`)}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Learning
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => router.push('/cursussen')}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
