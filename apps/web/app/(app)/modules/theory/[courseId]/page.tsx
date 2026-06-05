import { notFound } from 'next/navigation';
import { mockCourses } from '@/lib/mock/theory-data';
import CourseReader from '@/components/course/CourseReader';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = mockCourses[courseId];
  if (!course) notFound();

  return <CourseReader course={course} />;
}
