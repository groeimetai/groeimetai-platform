
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export const UpcomingLessons = ({ enrollments }) => {
  const router = useRouter();

  // This is a placeholder. In a real app, you'd fetch upcoming lessons.
  const upcomingLessons = enrollments
    .filter(e => e.progress < 100)
    .slice(0, 3)
    .map(e => ({ 
      id: e.id, 
      title: `Next lesson in ${e.course.title}`,
      courseId: e.courseId
    }));

  if (upcomingLessons.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Continue Learning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium">{lesson.title}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/cursussen/${lesson.courseId}`)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
