'use client';

import Link from 'next/link';
import { Check, Clock, Zap, Lock } from 'lucide-react';

interface LearningPathCourse {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  xpReward: number;
  completed: boolean;
}

interface LearningPathProps {
  courses: LearningPathCourse[];
  moduleHref: string;
}

export default function LearningPath({ courses, moduleHref }: LearningPathProps) {
  return (
    <ol className="relative" aria-label="Parcours d'apprentissage">
      {courses.map((course, i) => {
        const locked  = i > 0 && !courses[i - 1].completed;
        const active  = !locked && !course.completed;
        const done    = course.completed;

        return (
          <li key={course.id} className="relative flex gap-5 pb-8 last:pb-0">
            {/* Ligne verticale reliant les nœuds */}
            {i < courses.length - 1 && (
              <div
                aria-hidden="true"
                className="absolute left-[19px] top-10 bottom-0 w-px"
                style={{ background: done ? 'var(--color-complete)' : 'var(--color-border)' }}
              />
            )}

            {/* Nœud */}
            <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: 40 }}>
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  borderRadius: '50%',
                  background:   done   ? 'var(--color-complete-soft)'
                              : active ? 'var(--color-accent-soft)'
                              :          'var(--color-bg)',
                  border:       done   ? `2px solid var(--color-complete)`
                              : active ? `2px solid var(--color-accent)`
                              :          `2px solid var(--color-border)`,
                  // Active node is slightly larger, visually focal
                  transform:    active ? 'scale(1.15)' : 'scale(1)',
                  transition:   'transform 0.2s ease',
                }}
                aria-hidden="true"
              >
                {done ? (
                  <Check size={16} style={{ color: 'var(--color-complete)' }} strokeWidth={2.5} />
                ) : locked ? (
                  <Lock size={14} style={{ color: 'var(--color-border)' }} />
                ) : (
                  <span
                    className="w-3 h-3"
                    style={{
                      borderRadius: '50%',
                      background:   'var(--color-accent)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Contenu de la leçon */}
            <div className="flex-1 min-w-0 pt-1.5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold leading-snug mb-1"
                    style={{
                      color:   locked ? 'var(--color-muted)' : done ? 'var(--color-body)' : 'var(--color-ink)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {course.title}
                  </p>
                  <div className="flex items-center gap-4">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <Clock size={11} aria-hidden="true" />
                      {course.estimatedMinutes} min
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: done ? 'var(--color-complete)' : 'var(--color-muted)' }}
                    >
                      <Zap size={11} aria-hidden="true" />
                      +{course.xpReward} XP
                    </span>
                  </div>
                </div>

                {!locked && (
                  <Link
                    href={`${moduleHref}/${course.id}`}
                    className="flex-shrink-0 px-4 py-1.5 text-sm font-medium transition-colors duration-150"
                    style={{
                      background:   done ? 'var(--color-bg)' : 'var(--color-accent)',
                      color:        done ? 'var(--color-muted)' : '#fff',
                      border:       done ? '1px solid var(--color-border)' : 'none',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={e => {
                      if (done) {
                        e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                        e.currentTarget.style.color       = 'var(--color-body)';
                      } else {
                        e.currentTarget.style.background = 'var(--color-accent-hover)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (done) {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color       = 'var(--color-muted)';
                      } else {
                        e.currentTarget.style.background = 'var(--color-accent)';
                      }
                    }}
                  >
                    {done ? 'Revoir' : 'Commencer'}
                  </Link>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
