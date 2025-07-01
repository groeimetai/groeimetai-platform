import { LessonViewer } from '@/components/courses/LessonViewer';

export default function LessonPage({ params }: { params: { id: string, slug: string[] } }) {
  const [lessonId] = params.slug;
  return <LessonViewer courseId={params.id} lessonId={lessonId} />;
}