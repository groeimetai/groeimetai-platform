'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Target, TrendingUp, Trophy, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { ObjectiveCard } from './ObjectiveCard';
import { ObjectiveForm } from './ObjectiveForm';
import { objectiveService } from '../../services/objectiveService';
import type { Objective } from '../../types';

interface ObjectiveDashboardProps {
  userId: string;
  availableCourses?: { id: string; title: string }[];
}

export function ObjectiveDashboard({ userId, availableCourses = [] }: ObjectiveDashboardProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    loadObjectives();
  }, [userId]);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const data = await objectiveService.getUserObjectives(userId);
      setObjectives(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (objs: Objective[]) => {
    const active = objs.filter(o => o.status === 'active');
    const completed = objs.filter(o => o.status === 'completed');
    const totalProgress = active.reduce((sum, o) => sum + o.progress.current, 0);
    
    setStats({
      total: objs.length,
      active: active.length,
      completed: completed.length,
      averageProgress: active.length > 0 ? Math.round(totalProgress / active.length) : 0,
    });
  };

  const handleCreateObjective = async (data: Partial<Objective>) => {
    try {
      if (editingObjective) {
        await objectiveService.updateObjective(editingObjective.id, data);
      } else {
        await objectiveService.createObjective(userId, data);
      }
      await loadObjectives();
      setShowForm(false);
      setEditingObjective(null);
    } catch (error) {
      console.error('Failed to save objective:', error);
    }
  };

  const handleDeleteObjective = async (objective: Objective) => {
    if (confirm('Are you sure you want to delete this objective?')) {
      try {
        await objectiveService.deleteObjective(objective.id);
        await loadObjectives();
      } catch (error) {
        console.error('Failed to delete objective:', error);
      }
    }
  };

  const handleStatusChange = async (objective: Objective, newStatus: Objective['status']) => {
    try {
      await objectiveService.updateObjective(objective.id, { status: newStatus });
      await loadObjectives();
    } catch (error) {
      console.error('Failed to update objective status:', error);
    }
  };

  const handleEditObjective = (objective: Objective) => {
    setEditingObjective(objective);
    setShowForm(true);
  };

  const filteredObjectives = objectives.filter(obj => {
    if (activeTab === 'all') return true;
    return obj.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {editingObjective ? 'Edit Objective' : 'Create New Objective'}
        </h2>
        <ObjectiveForm
          objective={editingObjective || undefined}
          onSubmit={handleCreateObjective}
          onCancel={() => {
            setShowForm(false);
            setEditingObjective(null);
          }}
          availableCourses={availableCourses}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Objectives</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning goals and progress
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Objective
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objectives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <Progress value={stats.averageProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Objectives List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredObjectives.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No objectives found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'all' 
                    ? "You haven't created any objectives yet."
                    : `You don't have any ${activeTab} objectives.`}
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Objective
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredObjectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  onEdit={handleEditObjective}
                  onDelete={handleDeleteObjective}
                  onStatusChange={handleStatusChange}
                  onViewDetails={(obj) => {
                    // TODO: Navigate to objective details page
                    console.log('View details:', obj);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}