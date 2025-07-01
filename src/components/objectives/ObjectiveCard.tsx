'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Flag,
  Edit,
  Trash2,
  CheckCircle,
  PauseCircle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Objective } from '../../types';

interface ObjectiveCardProps {
  objective: Objective;
  onEdit?: (objective: Objective) => void;
  onDelete?: (objective: Objective) => void;
  onStatusChange?: (objective: Objective, status: Objective['status']) => void;
  onViewDetails?: (objective: Objective) => void;
}

export function ObjectiveCard({
  objective,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
}: ObjectiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to safely parse date values which can be strings or Firestore Timestamps
  const parseDate = (date: any): Date | null => {
    if (!date) return null;
    if (typeof date.toDate === 'function') {
      return date.toDate(); // Handle Firestore Timestamp
    }
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate; // Handle date strings
  };

  const targetDateObject = parseDate(objective.targetDate);

  const daysUntilTarget = targetDateObject
    ? Math.ceil((targetDateObject.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getPriorityColor = (priority: Objective['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: Objective['status']) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: Objective['category']) => {
    switch (category) {
      case 'skill':
        return '🎯';
      case 'course':
        return '📚';
      case 'certificate':
        return '🏆';
      case 'personal':
        return '💪';
      case 'career':
        return '💼';
    }
  };

  const completedMilestones = objective.progress.milestones.filter(m => m.completed).length;
  const totalMilestones = objective.progress.milestones.length;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">{getCategoryIcon(objective.category)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{objective.title}</CardTitle>
                {objective.status !== 'active' && (
                  <div className="flex items-center gap-1">
                    {getStatusIcon(objective.status)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {objective.status}
                    </span>
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {objective.description}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {objective.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange?.(objective, 'paused')}>
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Pause Objective
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(objective, 'completed')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                </>
              )}
              {objective.status === 'paused' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(objective, 'active')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Resume Objective
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(objective)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(objective)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {objective.progress.current}%
              </span>
            </div>
            <Progress value={objective.progress.current} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Target Date</p>
                <p className="text-sm font-medium">
                  {targetDateObject ? format(targetDateObject, 'MMM d, yyyy') : 'No date set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time Left</p>
                <p className="text-sm font-medium">
                  {daysUntilTarget !== null ? (daysUntilTarget > 0 ? `${daysUntilTarget} days` : 'Overdue') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Priority and Milestones */}
          <div className="flex items-center justify-between">
            <Badge className={getPriorityColor(objective.priority)}>
              <Flag className="w-3 h-3 mr-1" />
              {objective.priority} priority
            </Badge>
            
            {totalMilestones > 0 && (
              <span className="text-sm text-muted-foreground">
                {completedMilestones}/{totalMilestones} milestones
              </span>
            )}
          </div>

          {/* Measurable Targets */}
          {objective.measurableTargets.length > 0 && (
            <div className="space-y-2">
              {objective.measurableTargets.slice(0, isExpanded ? undefined : 2).map((target, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{target.description || target.type}</span>
                  <span className="font-medium">
                    {target.current}/{target.target} {target.unit}
                  </span>
                </div>
              ))}
              {!isExpanded && objective.measurableTargets.length > 2 && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-primary hover:underline"
                >
                  +{objective.measurableTargets.length - 2} more targets
                </button>
              )}
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => onViewDetails?.(objective)}
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
