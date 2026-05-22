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
    course = await apiClient.get<CourseEntity>(`/courses/${courseId}`);
  } catch {
    notFound();
  }

  if (!course) notFound();

  const blocks = course.contentBlocks as ContentBlock[];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="text-xs text-gray-400">
        <Link href="/dashboard" className="hover:text-primary-600">Accueil</Link>
        <span className="mx-1">/</span>
        <Link href={`/modules/${moduleId}`} className="hover:text-primary-600">Module</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-600">{course.title}</span>
      </nav>

      <div>
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600 capitalize mb-2">
          {course.level}
        </span>
        <h1 className="font-display text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-xs text-gray-400 mt-1">+{course.xpReward} XP à la complétion</p>
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
