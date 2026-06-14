import Link from 'next/link';
import { BookOpen, Zap } from 'lucide-react';
import type { CourseEntity } from '@/types';

interface CourseCardProps {
  course: CourseEntity;
  moduleId: string;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Débutant',
  intermediate: 'Intermédiaire',
  advanced:     'Avancé',
};

const LEVEL_STYLES: Record<string, React.CSSProperties> = {
  beginner:     { background: 'var(--color-complete-soft)', color: 'var(--color-complete)' },
  intermediate: { background: 'var(--color-streak-soft)',   color: 'var(--color-streak)' },
  advanced:     { background: 'var(--color-error-soft)',    color: 'var(--color-error)' },
};

export default function CourseCard({ course, moduleId }: CourseCardProps) {
  return (
    <Link
      href={`/modules/${moduleId}/${course.id}`}
      className="group flex flex-col gap-3 p-5 transition-colors duration-200"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-10 w-10 flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-accent-soft)', borderRadius: '8px' }}
        >
          <BookOpen className="h-5 w-5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
        </div>
        <span
          className="px-2 py-0.5 text-xs font-medium"
          style={{
            borderRadius: '6px',
            ...(LEVEL_STYLES[course.level] ?? { background: 'var(--color-bg)', color: 'var(--color-muted)' }),
          }}
        >
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>
      </div>

      <div className="flex-1">
        <h3
          className="font-semibold line-clamp-2 transition-colors duration-200"
          style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}
        >
          {course.title}
        </h3>
      </div>

      <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-complete)' }}>
        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
        +{course.xpReward} XP
      </div>
    </Link>
  );
}
