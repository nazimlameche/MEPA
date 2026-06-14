import { notFound } from 'next/navigation';
import { mockCourses, mockCourseList } from '@/lib/mock/theory-data';
import CourseReader from '@/components/course/CourseReader';
import PageContainer from '@/components/layout/PageContainer';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = mockCourses[courseId];

  if (!course) {
    const listed = mockCourseList.find(c => c.id === courseId);
    if (!listed) notFound();

    return (
      <PageContainer size="narrow">
        <div className="py-16 text-center">
          <p className="text-4xl mb-4">🚧</p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '8px',
            }}
          >
            {listed.title}
          </h1>
          <p style={{ color: 'var(--color-text-soft)' }}>
            Ce cours est en cours de préparation. Reviens bientôt !
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="narrow">
      <CourseReader course={course} />
    </PageContainer>
  );
}
