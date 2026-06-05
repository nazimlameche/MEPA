import Link from 'next/link';
import { CheckCircle, Clock, Zap, ChevronRight } from 'lucide-react';
import { mockCourseList } from '@/lib/mock/theory-data';

export default function TheoryModulePage() {
  const completed = mockCourseList.filter(c => c.completed).length;
  const total     = mockCourseList.length;
  const pct       = Math.round((completed / total) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header module */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📚</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Parcours Théorique
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Leçons structurées pour comprendre l&apos;IA de zéro.
        </p>

        <div className="mt-5">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <span>{completed} / {total} cours terminés</span>
            <span>{pct}%</span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? 'var(--color-xp)' : 'var(--color-primary-light)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="flex flex-col gap-3">
        {mockCourseList.map((course, i) => {
          const locked = i > 0 && !mockCourseList[i - 1].completed;

          return (
            <div
              key={course.id}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: 'var(--color-surface-card)',
                border: `1px solid ${course.completed ? 'rgba(16,185,129,0.25)' : 'var(--color-surface-border)'}`,
                opacity: locked ? 0.45 : 1,
              }}
            >
              {/* Icône statut */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{
                  background: course.completed
                    ? 'rgba(16,185,129,0.12)'
                    : locked
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(76,31,212,0.12)',
                }}
              >
                {course.completed ? (
                  <CheckCircle size={20} style={{ color: '#10B981' }} aria-hidden="true" />
                ) : locked ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>🔒</span>
                ) : (
                  <span>▶️</span>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold truncate"
                  style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem' }}
                >
                  {course.title}
                </p>
                <p
                  className="text-sm truncate mt-0.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {course.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Clock size={12} aria-hidden="true" /> {course.estimatedMinutes} min
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--color-xp)' }}
                  >
                    <Zap size={12} aria-hidden="true" /> +{course.xpReward} XP
                  </span>
                </div>
              </div>

              {/* CTA */}
              {!locked && (
                <Link
                  href={`/modules/theory/${course.id}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex-shrink-0"
                  style={{
                    background: course.completed ? 'rgba(255,255,255,0.05)' : 'var(--color-primary)',
                    color: course.completed ? 'var(--color-text-secondary)' : '#fff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = course.completed
                      ? 'rgba(255,255,255,0.09)'
                      : 'var(--color-primary-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = course.completed
                      ? 'rgba(255,255,255,0.05)'
                      : 'var(--color-primary)';
                  }}
                >
                  {course.completed ? 'Revoir' : 'Commencer'}
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
