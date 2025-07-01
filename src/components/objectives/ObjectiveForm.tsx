'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  Calendar,
  Plus,
  X,
  Target,
  Flag,
  BookOpen,
  Trophy,
  User,
  Briefcase
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Objective, Milestone } from '../../types';

interface ObjectiveFormProps {
  objective?: Objective;
  onSubmit: (data: Partial<Objective>) => void;
  onCancel: () => void;
  availableCourses?: { id: string; title: string }[];
}

interface FormData {
  title: string;
  description: string;
  category: Objective['category'];
  priority: Objective['priority'];
  targetDate: string;
  relatedCourses: string[];
  relatedSkills: string[];
  measurableTargets: Objective['measurableTargets'];
  milestones: Milestone[];
  remindersEnabled: boolean;
  reminderFrequency: Objective['reminders']['frequency'];
  notes: string;
}

export function ObjectiveForm({
  objective,
  onSubmit,
  onCancel,
  availableCourses = [],
}: ObjectiveFormProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    objective?.relatedCourses || []
  );
  const [skills, setSkills] = useState<string[]>(objective?.relatedSkills || []);
  const [currentSkill, setCurrentSkill] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>(
    objective?.progress.milestones || []
  );
  const [measurableTargets, setMeasurableTargets] = useState(
    objective?.measurableTargets || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: objective?.title || '',
      description: objective?.description || '',
      category: objective?.category || 'personal',
      priority: objective?.priority || 'medium',
      targetDate: objective?.targetDate 
        ? format(new Date(objective.targetDate), 'yyyy-MM-dd')
        : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      remindersEnabled: objective?.reminders.enabled || false,
      reminderFrequency: objective?.reminders.frequency || 'weekly',
      notes: objective?.notes || '',
    },
  });

  const category = watch('category');

  const getCategoryIcon = (cat: Objective['category']) => {
    switch (cat) {
      case 'skill':
        return <Target className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'certificate':
        return <Trophy className="w-4 h-4" />;
      case 'personal':
        return <User className="w-4 h-4" />;
      case 'career':
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const addSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      title: '',
      description: '',
      targetDate: new Date(),
      completed: false,
      order: milestones.length,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const addMeasurableTarget = () => {
    setMeasurableTargets([
      ...measurableTargets,
      {
        type: 'custom',
        target: 1,
        current: 0,
        unit: '',
        description: '',
        trackingMethod: 'manual',
      },
    ]);
  };

  const updateMeasurableTarget = (index: number, field: string, value: any) => {
    const updated = [...measurableTargets];
    updated[index] = { ...updated[index], [field]: value };
    setMeasurableTargets(updated);
  };

  const removeMeasurableTarget = (index: number) => {
    setMeasurableTargets(measurableTargets.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: FormData) => {
    const objectiveData: Partial<Objective> = {
      ...data,
      targetDate: new Date(data.targetDate),
      relatedCourses: selectedCourses,
      relatedSkills: skills,
      measurableTargets,
      progress: {
        current: objective?.progress.current || 0,
        milestones,
        lastUpdate: new Date(),
      },
      reminders: {
        enabled: data.remindersEnabled,
        frequency: data.reminderFrequency,
      },
    };

    onSubmit(objectiveData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Define your objective and set its priority
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Objective Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Master React Development"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe what you want to achieve and why it's important..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as Objective['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Skill Development
                    </div>
                  </SelectItem>
                  <SelectItem value="course">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Course Completion
                    </div>
                  </SelectItem>
                  <SelectItem value="certificate">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Certificate Achievement
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Growth
                    </div>
                  </SelectItem>
                  <SelectItem value="career">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Career Advancement
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as Objective['priority'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-green-600" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-yellow-600" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-orange-600" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-red-600" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="targetDate">Target Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="targetDate"
                type="date"
                {...register('targetDate', { required: 'Target date is required' })}
                className="pl-10"
              />
            </div>
            {errors.targetDate && (
              <p className="text-sm text-red-500 mt-1">{errors.targetDate.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Courses */}
      {category === 'course' && availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Courses</CardTitle>
            <CardDescription>
              Select courses related to this objective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableCourses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourses([...selectedCourses, course.id]);
                      } else {
                        setSelectedCourses(
                          selectedCourses.filter((id) => id !== course.id)
                        );
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{course.title}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills to Develop</CardTitle>
          <CardDescription>
            Add skills you want to acquire or improve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              placeholder="e.g., JavaScript, Problem Solving"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="pl-3 pr-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Measurable Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Measurable Targets</CardTitle>
          <CardDescription>
            Define specific, measurable goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {measurableTargets.map((target, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Description"
                    value={target.description}
                    onChange={(e) => updateMeasurableTarget(index, 'description', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Target"
                      value={target.target}
                      onChange={(e) => updateMeasurableTarget(index, 'target', parseInt(e.target.value))}
                      className="w-24"
                    />
                    <Input
                      placeholder="Unit"
                      value={target.unit}
                      onChange={(e) => updateMeasurableTarget(index, 'unit', e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeasurableTarget(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMeasurableTarget}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Target
          </Button>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Break down your objective into smaller milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Milestone title"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    type="date"
                    value={format(new Date(milestone.targetDate), 'yyyy-MM-dd')}
                    onChange={(e) => updateMilestone(index, 'targetDate', new Date(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMilestone}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>
            Set up reminders to stay on track
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminders">Enable Reminders</Label>
            <Switch
              id="reminders"
              checked={watch('remindersEnabled')}
              onCheckedChange={(checked) => setValue('remindersEnabled', checked)}
            />
          </div>
          
          {watch('remindersEnabled') && (
            <div>
              <Label htmlFor="frequency">Reminder Frequency</Label>
              <Select
                value={watch('reminderFrequency')}
                onValueChange={(value) => setValue('reminderFrequency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Any additional thoughts or context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Add any notes, strategies, or thoughts about this objective..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {objective ? 'Update' : 'Create'} Objective
        </Button>
      </div>
    </form>
  );
}