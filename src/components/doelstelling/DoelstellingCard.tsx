/**
 * DoelstellingCard Component
 * Displays a single learning objective card with progress tracking
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Doelstelling, 
  UserDoelstellingProgress,
  DoelstellingType,
  DoelstellingLevel,
  DoelstellingCategory 
} from '@/types/doelstelling';
import { 
  Target, 
  Clock, 
  Award, 
  CheckCircle, 
  Circle,
  BarChart,
  BookOpen,
  Code,
  Users,
  Briefcase,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoelstellingCardProps {
  doelstelling: Doelstelling;
  progress?: UserDoelstellingProgress | null;
  onStart?: () => void;
  onContinue?: () => void;
  onViewDetails?: () => void;
  className?: string;
  showProgress?: boolean;
  compact?: boolean;
}

export function DoelstellingCard({
  doelstelling,
  progress,
  onStart,
  onContinue,
  onViewDetails,
  className,
  showProgress = true,
  compact = false
}: DoelstellingCardProps) {
  // Type icons
  const typeIcons: Record<DoelstellingType, React.ReactNode> = {
    knowledge: <BookOpen className="w-4 h-4" />,
    skill: <Code className="w-4 h-4" />,
    competency: <Target className="w-4 h-4" />,
    attitude: <Users className="w-4 h-4" />,
    certification: <Award className="w-4 h-4" />
  };

  // Category icons
  const categoryIcons: Record<DoelstellingCategory, React.ReactNode> = {
    technical: <Code className="w-4 h-4" />,
    conceptual: <BookOpen className="w-4 h-4" />,
    practical: <Target className="w-4 h-4" />,
    professional: <Briefcase className="w-4 h-4" />,
    personal: <User className="w-4 h-4" />
  };

  // Level colors
  const levelColors: Record<DoelstellingLevel, string> = {
    foundation: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800'
  };

  // Progress calculation
  const getProgressPercentage = () => {
    if (!progress || !progress.outcomesProgress.length) return 0;
    const achieved = progress.outcomesProgress.filter(op => op.achieved).length;
    return Math.round((achieved / doelstelling.outcomes.length) * 100);
  };

  const progressPercentage = getProgressPercentage();
  const isCompleted = progress?.status === 'completed' || progress?.status === 'mastered';
  const isMastered = progress?.status === 'mastered';
  const isInProgress = progress?.status === 'in-progress';

  // Action button logic
  const getActionButton = () => {
    if (isCompleted) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewDetails}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {isMastered ? 'Mastered' : 'Completed'}
        </Button>
      );
    }
    
    if (isInProgress && onContinue) {
      return (
        <Button 
          variant="default" 
          size="sm"
          onClick={onContinue}
        >
          Continue
        </Button>
      );
    }
    
    if (!progress && onStart) {
      return (
        <Button 
          variant="default" 
          size="sm"
          onClick={onStart}
        >
          Start
        </Button>
      );
    }
    
    return null;
  };

  if (compact) {
    return (
      <Card 
        className={cn(
          "p-4 hover:shadow-md transition-shadow cursor-pointer",
          isCompleted && "border-green-500",
          isMastered && "border-gold-500 bg-gradient-to-br from-yellow-50 to-white",
          className
        )}
        onClick={onViewDetails}
        data-testid="doelstelling-card-compact"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "p-2 rounded-full",
              isCompleted ? "bg-green-100" : "bg-gray-100"
            )}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{doelstelling.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {doelstelling.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {doelstelling.points} pts
                </span>
                {progress && (
                  <span className="flex items-center gap-1">
                    <BarChart className="w-3 h-3" />
                    {progressPercentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
          {getActionButton()}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "p-6 hover:shadow-lg transition-shadow",
        isCompleted && "border-green-500",
        isMastered && "border-gold-500 bg-gradient-to-br from-yellow-50 to-white",
        className
      )}
      data-testid="doelstelling-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-gray-100">
              {typeIcons[doelstelling.type]}
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              levelColors[doelstelling.level]
            )}>
              {doelstelling.level}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              {categoryIcons[doelstelling.category]}
              {doelstelling.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{doelstelling.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {doelstelling.description}
          </p>
        </div>
        {isMastered && (
          <Award className="w-8 h-8 text-yellow-500" />
        )}
      </div>

      {/* Learning Outcomes */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Learning Outcomes:</h4>
        <ul className="space-y-1">
          {doelstelling.outcomes.slice(0, 3).map((outcome, index) => (
            <li 
              key={outcome.id} 
              className="text-xs text-gray-600 flex items-start gap-2"
            >
              <div className="mt-0.5">
                {progress?.outcomesProgress.find(op => op.outcomeId === outcome.id)?.achieved ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <Circle className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className="flex-1">{outcome.description}</span>
            </li>
          ))}
          {doelstelling.outcomes.length > 3 && (
            <li className="text-xs text-gray-500 ml-5">
              +{doelstelling.outcomes.length - 3} more outcomes
            </li>
          )}
        </ul>
      </div>

      {/* Progress Bar */}
      {showProgress && progress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all",
                isMastered ? "bg-yellow-500" : "bg-blue-600"
              )}
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {doelstelling.estimatedTime} min
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            {doelstelling.points} points
          </span>
          {progress && (
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Score: {progress.currentScore}%
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewDetails}
          >
            Details
          </Button>
          {getActionButton()}
        </div>
      </div>
    </Card>
  );
}