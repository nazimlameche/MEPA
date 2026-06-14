import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import LessonBlock from '@/components/course/LessonBlock';
import QuizWidget from '@/components/course/QuizWidget';
import type { CourseEntity, ContentBlock } from '@/types';

export default async function CoursePage({
  params,
}: {
  params: Promise<{ moduleId: string; courseId: string }>;
}) {
  const { moduleId, courseId } = await params;

  let course: CourseEntity | null = null;
  try {
    course = await apiClient.get<CourseEntity>(`/courses/${courseId}`, undefined, 300);
  } catch {
    notFound();
  }

  if (!course) notFound();

  const blocks = course.contentBlocks as ContentBlock[];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="text-xs" style={{ color: 'var(--color-muted)' }}>
        <Link href="/dashboard" className="hover-accent">
          Accueil
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/modules/${moduleId}`} className="hover-accent">
          Module
        </Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--color-body)' }}>{course.title}</span>
      </nav>

      <div>
        <span
          className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize mb-2"
          style={{
            background:   'var(--color-accent-soft)',
            color:        'var(--color-accent)',
            borderRadius: '6px',
          }}
        >
          {course.level}
        </span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)' }}>
          {course.title}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          +{course.xpReward} XP à la complétion
        </p>
      </div>

      <div className="space-y-4">
        {blocks.map((block, i) => {
          if (block.type === 'quiz') {
            return <QuizWidget key={i} block={block} courseId={courseId} />;
          }
          return <LessonBlock key={i} block={block} />;
        })}
      </div>
    </div>
  );
}
