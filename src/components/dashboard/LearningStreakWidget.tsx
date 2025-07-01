
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

export const LearningStreakWidget = ({ streak }) => {
  return (
    <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 rounded-full px-4 py-2">
      <Flame className="h-6 w-6" />
      <div className="text-center">
        <p className="font-bold text-lg">{streak.days}</p>
        <p className="text-xs font-medium">Day Streak</p>
      </div>
    </div>
  );
};
