import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { mockCourseList } from '@/lib/mock/theory-data';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import LearningPath from '@/components/course/LearningPath';

interface CourseProgressDto {
  courseId:    string;
  status:      'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export default async function TheoryModulePage() {
  const session = await auth();
  const token   = session?.accessToken;

  let completedIds = new Set<string>();
  if (token) {
    try {
      const rows = await apiClient.get<CourseProgressDto[]>('/progress/courses', token);
      completedIds = new Set(
        rows.filter(r => r.status === 'completed').map(r => r.courseId),
      );
    } catch {
      // API unavailable — no course marked as completed
    }
  }

  const courses = mockCourseList.map(c => ({
    ...c,
    completed: completedIds.has(c.id),
  }));

  const completed = courses.filter(c => c.completed).length;
  const total     = courses.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progressBar = (
    <div style={{ maxWidth: '320px' }}>
      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
        <span>{completed} / {total} cours terminés</span>
        <span>{pct}%</span>
      </div>
      <div
        className="w-full h-1 overflow-hidden"
        style={{ background: 'var(--color-border)', borderRadius: '2px' }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width:        `${pct}%`,
            background:   pct === 100 ? 'var(--color-complete)' : 'var(--color-accent)',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );

  return (
    <PageContainer size="default">
      <PageHeader
        title="Parcours théorique"
        subtitle="Leçons structurées pour comprendre l'IA de zéro."
      >
        {progressBar}
      </PageHeader>

      <Section>
        <LearningPath
          courses={courses}
          moduleHref="/modules/theory"
        />
      </Section>
    </PageContainer>
  );
}
