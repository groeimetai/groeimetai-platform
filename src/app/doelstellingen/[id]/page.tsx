'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Plus,
  MessageSquare,
  BarChart,
  Flag,
  Edit
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/AuthProvider';
import { objectiveService } from '../../../services/objectiveService';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import type { Objective, ObjectiveProgress } from '../../../types';

export default function ObjectiveDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [progressHistory, setProgressHistory] = useState<ObjectiveProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadObjectiveData();
    }
  }, [user, params.id]);

  const loadObjectiveData = async () => {
    try {
      setLoading(true);
      const [objectiveData, progressData] = await Promise.all([
        objectiveService.getObjective(params.id),
        objectiveService.getObjectiveProgress(params.id)
      ]);
      
      if (!objectiveData || objectiveData.userId !== user?.uid) {
        router.push('/doelstellingen');
        return;
      }
      
      setObjective(objectiveData);
      setProgressHistory(progressData);
    } catch (error) {
      console.error('Failed to load objective:', error);
      router.push('/doelstellingen');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReflection = async () => {
    if (!objective || !reflectionText.trim()) return;

    try {
      setSavingReflection(true);
      await objectiveService.addReflection(objective.id, reflectionText);
      setReflectionText('');
      await loadObjectiveData();
    } catch (error) {
      console.error('Failed to add reflection:', error);
    } finally {
      setSavingReflection(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!objective) return;

    try {
      await objectiveService.completeMilestone(objective.id, milestoneId);
      await loadObjectiveData();
    } catch (error) {
      console.error('Failed to complete milestone:', error);
    }
  };

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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!objective || !user) {
    return null;
  }

  const daysUntilTarget = Math.ceil(
    (new Date(objective.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const completedMilestones = objective.progress.milestones.filter(m => m.completed).length;
  const totalMilestones = objective.progress.milestones.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/doelstellingen')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Objectives
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{getCategoryIcon(objective.category)}</div>
            <div>
              <h1 className="text-3xl font-bold">{objective.title}</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {objective.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={getPriorityColor(objective.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {objective.priority} priority
                </Badge>
                <Badge variant="outline">
                  {objective.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/doelstellingen/${objective.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{objective.progress.current}%</div>
            <Progress value={objective.progress.current} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(objective.targetDate), 'MMM d')}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(objective.targetDate), 'yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Left</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilTarget > 0 ? daysUntilTarget : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {daysUntilTarget > 0 ? 'days remaining' : 'overdue'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedMilestones}/{totalMilestones}
            </div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress History</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Measurable Targets */}
          {objective.measurableTargets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Measurable Targets</CardTitle>
                <CardDescription>Track your progress towards specific goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {objective.measurableTargets.map((target, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {target.description || target.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {target.current}/{target.target} {target.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(target.current / target.target) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {objective.progress.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Key checkpoints on your journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {objective.progress.milestones
                  .sort((a, b) => a.order - b.order)
                  .map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        milestone.completed ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      <button
                        onClick={() => !milestone.completed && handleCompleteMilestone(milestone.id)}
                        disabled={milestone.completed}
                        className={`mt-1 ${
                          milestone.completed
                            ? 'text-green-600'
                            : 'text-gray-400 hover:text-primary'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          milestone.completed ? 'line-through text-gray-600' : ''
                        }`}>
                          {milestone.title}
                        </h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Target: {format(new Date(milestone.targetDate), 'MMM d, yyyy')}
                          {milestone.completed && milestone.completedAt && (
                            <span className="ml-2">
                              • Completed: {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Related Skills */}
          {objective.relatedSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills to Develop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {objective.relatedSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {objective.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{objective.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {progressHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No progress recorded yet</h3>
                <p className="text-muted-foreground text-center">
                  Progress will be tracked as you complete courses and activities.
                </p>
              </CardContent>
            </Card>
          ) : (
            progressHistory.map((progress) => (
              <Card key={progress.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {format(new Date(progress.date), 'MMM d, yyyy - h:mm a')}
                    </CardTitle>
                    <Badge variant={progress.progressDelta > 0 ? 'default' : 'secondary'}>
                      {progress.progressDelta > 0 ? '+' : ''}{progress.progressDelta}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {progress.activities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          {activity.type && (
                            <p className="text-xs text-muted-foreground">
                              {activity.type.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Progress</span>
                      <span className="font-medium">{progress.newTotalProgress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reflections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Reflection</CardTitle>
              <CardDescription>
                Record your thoughts, challenges, and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="How is your progress going? What have you learned? What challenges are you facing?"
                rows={4}
              />
              <Button
                onClick={handleAddReflection}
                disabled={!reflectionText.trim() || savingReflection}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {savingReflection ? 'Saving...' : 'Add Reflection'}
              </Button>
            </CardContent>
          </Card>

          {objective.reflections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reflections yet</h3>
                <p className="text-muted-foreground text-center">
                  Start documenting your journey by adding your first reflection.
                </p>
              </CardContent>
            </Card>
          ) : (
            objective.reflections
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((reflection) => (
                <Card key={reflection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {format(new Date(reflection.date), 'MMM d, yyyy')}
                      </CardTitle>
                      <Badge variant="outline">
                        {reflection.progressAtTime}% progress
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{reflection.content}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}