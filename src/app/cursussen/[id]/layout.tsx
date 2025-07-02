import { getCourseById } from '@/lib/data/courses';
import promptEngineeringModules from '@/lib/data/course-content/prompt-engineering';
import { CourseHeader } from '@/components/courses/CourseHeader';
import { notFound } from 'next/navigation';

export default function CourseLayout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
  let course = getCourseById(params.id);

  if (!course) {
    notFound();
  }

  if (course.id === 'prompt-engineering-essentials') {
    course = { ...course, modules: promptEngineeringModules };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseHeader course={course} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}