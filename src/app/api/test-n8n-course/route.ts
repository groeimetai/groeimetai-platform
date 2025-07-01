import { NextResponse } from 'next/server';
import { getCourseWithContent } from '@/lib/data/course-loader';

export async function GET() {
  try {
    console.log('Testing n8n-make-basics course loading...');
    
    const course = await getCourseWithContent('n8n-make-basics');
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    const result = {
      title: course.title,
      id: course.id,
      modulesCount: course.modules.length,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        lessonsCount: module.lessons.length,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          hasContent: !!lesson.content
        }))
      }))
    };
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error testing n8n course:', error);
    return NextResponse.json({ 
      error: 'Failed to load course', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}