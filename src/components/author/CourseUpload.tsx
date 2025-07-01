'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { courseService } from '@/services/courseService';
import { Course, Lesson } from '@/types';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Video, 
  Image,
  Clock,
  Euro,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  AlertCircle
} from 'lucide-react';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  isPreview: boolean;
  order: number;
}

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  imageUrl: string;
  modules: CourseModule[];
  isPublished: boolean;
}

interface CourseUploadProps {
  initialData?: Partial<Course>;
  courseId?: string;
  onSave?: (courseId: string) => void;
}

export function CourseUpload({ initialData, courseId, onSave }: CourseUploadProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || '',
    level: initialData?.level || 'beginner',
    price: initialData?.price || 0,
    imageUrl: initialData?.imageUrl || '',
    modules: [],
    isPublished: initialData?.isPublished || false,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (formData.modules.length === 0) {
      newErrors.modules = 'At least one module is required';
    }

    // Validate modules
    formData.modules.forEach((module, moduleIndex) => {
      if (!module.title.trim()) {
        newErrors[`module-${moduleIndex}-title`] = 'Module title is required';
      }
      if (module.lessons.length === 0) {
        newErrors[`module-${moduleIndex}-lessons`] = 'At least one lesson is required';
      }
      
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim()) {
          newErrors[`lesson-${moduleIndex}-${lessonIndex}-title`] = 'Lesson title is required';
        }
        if (!lesson.videoUrl.trim()) {
          newErrors[`lesson-${moduleIndex}-${lessonIndex}-video`] = 'Video URL is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab('details');
      return;
    }

    try {
      setIsLoading(true);

      // Calculate total duration
      const totalDuration = formData.modules.reduce((total, module) => {
        return total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0);
      }, 0);

      // Count total lessons
      const lessonsCount = formData.modules.reduce((total, module) => total + module.lessons.length, 0);

      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        currency: 'EUR' as const,
        imageUrl: formData.imageUrl,
        duration: totalDuration,
        lessonsCount: lessonsCount,
        studentsCount: 0,
        rating: 0,
        isPublished: formData.isPublished,
        instructorId: '', // Will be set by the backend
        instructor: {} as any, // Will be set by the backend
      };

      let savedCourseId: string;
      
      if (courseId) {
        // Update existing course
        await courseService.updateCourse(courseId, courseData);
        savedCourseId = courseId;
      } else {
        // Create new course
        savedCourseId = await courseService.createCourse(courseData);
      }

      // Save lessons
      let lessonOrder = 0;
      for (const module of formData.modules) {
        for (const lesson of module.lessons) {
          const lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> = {
            courseId: savedCourseId,
            title: `${module.title}: ${lesson.title}`,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lessonOrder++,
            isPreview: lesson.isPreview,
          };

          if (lesson.id && lesson.id.startsWith('existing-')) {
            // Update existing lesson
            await courseService.updateLesson(lesson.id.replace('existing-', ''), lessonData);
          } else {
            // Create new lesson
            await courseService.createLesson(lessonData);
          }
        }
      }

      if (onSave) {
        onSave(savedCourseId);
      } else {
        router.push('/author/dashboard');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ submit: 'Failed to save course. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    const newModule: CourseModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      lessons: [],
    };
    setFormData({ ...formData, modules: [...formData.modules, newModule] });
  };

  const removeModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter(m => m.id !== moduleId),
    });
  };

  const updateModule = (moduleId: string, updates: Partial<CourseModule>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  const addLesson = (moduleId: string) => {
    const newLesson: LessonData = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      duration: 10,
      isPreview: false,
      order: 0,
    };

    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ),
    });
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ),
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<LessonData>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? {
              ...m,
              lessons: m.lessons.map(l => 
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
          : m
      ),
    });
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = formData.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const newModules = [...formData.modules];
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;

    if (targetIndex >= 0 && targetIndex < newModules.length) {
      [newModules[moduleIndex], newModules[targetIndex]] = [newModules[targetIndex], newModules[moduleIndex]];
      setFormData({ ...formData, modules: newModules });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="modules">Modules & Lessons</TabsTrigger>
          <TabsTrigger value="preview">Preview & Publish</TabsTrigger>
        </TabsList>

        {/* Course Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Basic information about your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Web Development Bootcamp"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="A brief description that appears in course cards"
                  rows={2}
                />
                {errors.shortDescription && (
                  <p className="text-sm text-red-500">{errors.shortDescription}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of what students will learn"
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-automation">AI & Automation</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (EUR) *</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Thumbnail URL</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules & Lessons Tab */}
        <TabsContent value="modules">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Modules</CardTitle>
                    <CardDescription>
                      Organize your course content into modules and lessons
                    </CardDescription>
                  </div>
                  <Button onClick={addModule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errors.modules && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.modules}</AlertDescription>
                  </Alert>
                )}

                {formData.modules.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No modules yet. Click "Add Module" to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.modules.map((module, moduleIndex) => (
                      <Card key={module.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={module.title}
                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                placeholder="Module title"
                                className="font-semibold"
                              />
                              {errors[`module-${moduleIndex}-title`] && (
                                <p className="text-sm text-red-500">{errors[`module-${moduleIndex}-title`]}</p>
                              )}
                              <Textarea
                                value={module.description}
                                onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                placeholder="Module description"
                                rows={2}
                              />
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveModule(module.id, 'up')}
                                disabled={moduleIndex === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveModule(module.id, 'down')}
                                disabled={moduleIndex === formData.modules.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeModule(module.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {errors[`module-${moduleIndex}-lessons`] && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors[`module-${moduleIndex}-lessons`]}</AlertDescription>
                              </Alert>
                            )}
                            
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1 space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                      placeholder="Lesson title"
                                      className="flex-1"
                                    />
                                    <Input
                                      value={lesson.videoUrl}
                                      onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                      placeholder="Video URL"
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={lesson.duration}
                                      onChange={(e) => updateLesson(module.id, lesson.id, { duration: parseInt(e.target.value) || 0 })}
                                      placeholder="Duration"
                                      className="w-24"
                                    />
                                  </div>
                                  {(errors[`lesson-${moduleIndex}-${lessonIndex}-title`] || errors[`lesson-${moduleIndex}-${lessonIndex}-video`]) && (
                                    <p className="text-sm text-red-500">
                                      {errors[`lesson-${moduleIndex}-${lessonIndex}-title`] || errors[`lesson-${moduleIndex}-${lessonIndex}-video`]}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4">
                                    <Label className="flex items-center gap-2">
                                      <Switch
                                        checked={lesson.isPreview}
                                        onCheckedChange={(checked) => updateLesson(module.id, lesson.id, { isPreview: checked })}
                                      />
                                      <span className="text-sm">Preview lesson</span>
                                    </Label>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(module.id)}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Lesson
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview & Publish Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Publish</CardTitle>
              <CardDescription>
                Review your course and publish when ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{formData.title || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{formData.category || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{formData.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">€{formData.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Modules</p>
                    <p className="font-medium">{formData.modules.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Lessons</p>
                    <p className="font-medium">
                      {formData.modules.reduce((sum, m) => sum + m.lessons.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Lessons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preview Lessons</h3>
                {formData.modules.flatMap(m => 
                  m.lessons.filter(l => l.isPreview).map(l => ({
                    ...l,
                    moduleName: m.title
                  }))
                ).length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No preview lessons selected. Consider marking at least one lesson as preview to give potential students a taste of your course.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {formData.modules.flatMap(m => 
                      m.lessons.filter(l => l.isPreview).map(l => (
                        <div key={l.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {m.title}: {l.title}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Publish Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Publish Settings</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Course Status</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.isPublished ? 'Your course is live and visible to students' : 'Your course is in draft mode'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.push('/author/dashboard')}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {courseId ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </Button>
              </div>

              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}