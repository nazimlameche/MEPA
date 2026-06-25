'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { mockExercises } from '@/lib/mock/prompting-data';
import AlKoCorner from '@/components/mascot/AlKoCorner';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import type { PromptExercise } from '@/lib/types/prompting';

const DIFFICULTY_CONFIG = {
  facile:    { label: 'Facile',    color: 'var(--color-complete)', bg: 'var(--color-complete-soft)' },
  moyen:     { label: 'Moyen',     color: 'var(--color-streak)',   bg: 'var(--color-streak-soft)'   },
  difficile: { label: 'Difficile', color: 'var(--color-error)',    bg: 'var(--color-error-soft)'    },
} as const;

interface AttemptSummary {
  exerciseId: string;
  totalScore: number;
  passed:     boolean;
}

export default function PromptingModulePage() {
  const { data: session }         = useSession();
  const [exercises, setExercises] = useState<PromptExercise[]>(mockExercises);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;

    fetch(`${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/prompting/attempts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((attempts: AttemptSummary[] | null) => {
        if (!attempts?.length) return;

        const bestScoreMap = new Map<string, number>();
        const passedSet    = new Set<string>();

        for (const a of attempts) {
          if (a.passed) passedSet.add(a.exerciseId);
          const cur = bestScoreMap.get(a.exerciseId) ?? 0;
          if (a.totalScore > cur) bestScoreMap.set(a.exerciseId, a.totalScore);
        }

        setExercises(mockExercises.map(ex => ({
          ...ex,
          completed: passedSet.has(ex.id),
          bestScore: bestScoreMap.get(ex.id) ?? ex.bestScore,
        })));
      })
      .catch(() => { /* garde les données mock en cas d'erreur */ });
  }, [session?.accessToken]);

  const completed = exercises.filter(e => e.completed).length;
  const total     = exercises.length;
  const pct       = Math.round((completed / total) * 100);

  const progressBar = (
    <div style={{ maxWidth: '320px' }}>
      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
        <span>{completed} / {total} exercices réussis</span>
        <span>{pct}%</span>
      </div>
      <div
        className="w-full h-1 overflow-hidden"
        style={{ background: 'var(--color-border)', borderRadius: '2px' }}
      >
        <div
          className="h-full"
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
        title="Atelier prompting"
        subtitle="Apprends à rédiger des prompts efficaces, clairs et sans données personnelles."
      >
        {progressBar}
      </PageHeader>

      <Section>
        <div
          className="p-5 flex gap-3 mb-6"
          style={{
            background:   'var(--color-surface)',
            border:       '1px solid var(--color-border)',
            borderLeft:   '2px solid var(--color-accent)',
            borderRadius: '8px',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
            On te donne un sujet. Tu rédiges le meilleur prompt possible pour demander à une IA de t&apos;aider.
            L&apos;IA évalue ton prompt sur 4 critères : clarté de l&apos;objectif, contexte, format de sortie, et sécurité des données.
            Réessaie jusqu&apos;au score de 90/100 ou plus.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {exercises.map(exercise => {
            const diff = DIFFICULTY_CONFIG[exercise.difficulty];

            return (
              <div
                key={exercise.id}
                className="p-5 flex items-center gap-4"
                style={{
                  background:   'var(--color-surface)',
                  border:       `1px solid ${exercise.completed ? 'var(--color-complete)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold" style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>
                      {exercise.title}
                    </p>
                    <span
                      className="px-2 py-0.5 text-xs font-medium"
                      style={{ background: diff.bg, color: diff.color, borderRadius: '6px' }}
                    >
                      {diff.label}
                    </span>
                    {exercise.bestScore !== null && (
                      <span
                        className="px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                      >
                        Meilleur : {exercise.bestScore}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate" style={{ color: 'var(--color-body)' }}>
                    {exercise.subject}
                  </p>
                  <span className="flex items-center gap-1 text-xs mt-2 font-medium" style={{ color: 'var(--color-complete)' }}>
                    <Zap size={12} aria-hidden="true" /> +{exercise.xpReward} XP
                  </span>
                </div>

                <Link
                  href={`/modules/prompting/${exercise.id}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 flex-shrink-0"
                  style={{
                    background:   exercise.completed ? 'var(--color-bg)' : 'var(--color-accent)',
                    color:        exercise.completed ? 'var(--color-muted)' : '#fff',
                    border:       exercise.completed ? '1px solid var(--color-border)' : 'none',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = exercise.completed
                      ? 'var(--color-surface)'
                      : 'var(--color-accent-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = exercise.completed
                      ? 'var(--color-bg)'
                      : 'var(--color-accent)';
                  }}
                >
                  {exercise.completed ? 'Rejouer' : 'Commencer'}
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      </Section>
      <AlKoCorner position="bottom-right" />
    </PageContainer>
  );
}
