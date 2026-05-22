import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MODULE_CONFIGS } from '@ai-edu/shared';
import CourseCard from '@/components/course/CourseCard';
import { apiClient } from '@/lib/api-client';
import type { CourseEntity } from '@/types';

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const moduleConfig = MODULE_CONFIGS.find((m) => m.id === moduleId);
  if (!moduleConfig) notFound();

  let courses: CourseEntity[] = [];
  try {
    courses = await apiClient.get<CourseEntity[]>(`/courses?moduleId=${moduleId}`);
  } catch {
    courses = [];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <nav className="text-xs text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-primary-600">Accueil</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-600">{moduleConfig.label}</span>
        </nav>
        <h1 className="font-display text-2xl font-bold text-gray-900">{moduleConfig.label}</h1>
        <p className="text-gray-500 mt-1 text-sm">{courses.length} cours disponibles</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-200 p-10 text-center text-gray-400">
          Aucun cours disponible pour ce module pour l&apos;instant.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} moduleId={moduleId} />
          ))}
        </div>
      )}
    </div>
  );
}
