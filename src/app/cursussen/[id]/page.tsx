import { CourseViewer } from '@/components/courses/CourseViewer';

export default function CourseOverviewPage({ params }: { params: { id: string } }) {
  return <CourseViewer courseId={params.id} />;
}