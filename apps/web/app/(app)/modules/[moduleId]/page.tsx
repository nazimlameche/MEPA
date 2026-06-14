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
    courses = await apiClient.get<CourseEntity[]>(`/courses/module/${moduleId}`, undefined, 60);
  } catch {
    courses = [];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <nav className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
          <Link href="/dashboard" className="hover-accent">
            Accueil
          </Link>
          <span className="mx-1">/</span>
          <span style={{ color: 'var(--color-body)' }}>{moduleConfig.label}</span>
        </nav>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)' }}>
          {moduleConfig.label}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          {courses.length} cours disponibles
        </p>
      </div>

      {courses.length === 0 ? (
        <div
          className="p-10 text-center text-sm"
          style={{
            border:       '1px dashed var(--color-border-strong)',
            borderRadius: '8px',
            color:        'var(--color-muted)',
          }}
        >
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
