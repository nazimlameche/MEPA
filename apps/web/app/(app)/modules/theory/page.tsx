import { mockCourseList } from '@/lib/mock/theory-data';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import LearningPath from '@/components/course/LearningPath';

export default function TheoryModulePage() {
  const completed = mockCourseList.filter(c => c.completed).length;
  const total     = mockCourseList.length;
  const pct       = Math.round((completed / total) * 100);

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
          courses={mockCourseList}
          moduleHref="/modules/theory"
        />
      </Section>
    </PageContainer>
  );
}
