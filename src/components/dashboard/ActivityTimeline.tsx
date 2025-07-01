
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, CheckCircle, Award } from 'lucide-react';

export type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string | Date;
};

const activityIcons = {
  COURSE_ENROLLMENT: <BookOpen className="h-5 w-5 text-blue-500" />,
  LESSON_COMPLETION: <CheckCircle className="h-5 w-5 text-green-500" />,
  CERTIFICATE_EARNED: <Award className="h-5 w-5 text-purple-500" />,
};

export const ActivityTimeline = ({ activities }) => {
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
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
