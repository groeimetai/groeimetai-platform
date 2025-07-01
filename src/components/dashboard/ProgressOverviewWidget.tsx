
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

export const ProgressOverviewWidget = ({ enrollments }) => {
  const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  const averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-lg font-bold">{averageProgress}%</span>
          </div>
          <Progress value={averageProgress} />
          <p className="text-xs text-gray-500 pt-1">
            Your average progress across all enrolled courses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
