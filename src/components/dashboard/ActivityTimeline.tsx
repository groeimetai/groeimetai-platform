
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, isValid } from 'date-fns';
import { nl } from 'date-fns/locale';
import { BookOpen, CheckCircle, Award } from 'lucide-react';

export type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string | Date | any; // Allow any type for Firestore timestamps
  title?: string; // Optional title property
  metadata?: any; // Optional metadata
};

const activityIcons = {
  COURSE_ENROLLMENT: <BookOpen className="h-5 w-5 text-blue-500" />,
  LESSON_COMPLETION: <CheckCircle className="h-5 w-5 text-green-500" />,
  CERTIFICATE_EARNED: <Award className="h-5 w-5 text-purple-500" />,
  course_started: <BookOpen className="h-5 w-5 text-blue-500" />,
  course_completed: <Award className="h-5 w-5 text-green-500" />,
  lesson_completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  certificate_earned: <Award className="h-5 w-5 text-purple-500" />,
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No recent activity to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <li key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {activityIcons[activity.type] || <BookOpen className="h-5 w-5 text-gray-400" />}
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {(() => {
                    try {
                      const date = new Date(activity.timestamp);
                      if (isValid(date)) {
                        return formatDistanceToNow(date, { 
                          addSuffix: true,
                          locale: nl 
                        });
                      }
                      return 'Onbekende tijd';
                    } catch {
                      return 'Onbekende tijd';
                    }
                  })()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
