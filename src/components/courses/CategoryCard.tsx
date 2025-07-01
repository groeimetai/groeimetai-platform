'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseData } from '@/lib/data/courses';
import { ArrowRight, BookOpen, Code, Cpu, Lightbulb } from 'lucide-react';

interface CategoryCardProps {
  category: CourseData['category'];
  description: string;
  courseCount: number;
  topCourses: CourseData[];
}

const categoryIcons: Record<CourseData['category'], React.ReactNode> = {
  'Fundamenten': <Lightbulb className="w-8 h-8" />,
  'Automation': <Cpu className="w-8 h-8" />,
  'Development': <Code className="w-8 h-8" />,
  'Praktijk': <BookOpen className="w-8 h-8" />
};

const categoryColors: Record<CourseData['category'], string> = {
  'Fundamenten': 'bg-blue-100 text-blue-700',
  'Automation': 'bg-purple-100 text-purple-700',
  'Development': 'bg-green-100 text-green-700',
  'Praktijk': 'bg-orange-100 text-orange-700'
};

export default function CategoryCard({ category, description, courseCount, topCourses }: CategoryCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${categoryColors[category]}`}>
            {categoryIcons[category]}
          </div>
          <Badge variant="secondary" className="text-sm">
            {courseCount} {courseCount === 1 ? 'cursus' : 'cursussen'}
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">{category}</CardTitle>
        <CardDescription className="text-base mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-sm text-gray-600">Populaire cursussen:</h4>
          {topCourses.slice(0, 3).map((course) => (
            <Link 
              key={course.id} 
              href={`/cursussen/${course.id}`}
              className="block group/course"
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h5 className="font-medium text-sm group-hover/course:text-blue-600 transition-colors">
                    {course.title}
                  </h5>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                    {course.rating && (
                      <>
                        <span>•</span>
                        <span>⭐ {course.rating}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">€{course.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <Link href={`/cursussen?category=${encodeURIComponent(category)}`}>
          <Button className="w-full group-hover:bg-blue-600 transition-colors">
            Bekijk alle {category} cursussen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}