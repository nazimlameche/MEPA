'use client';

import { motion } from 'framer-motion';
import type { PromptScoreOutput } from '@/lib/types/prompting';
import AlKo from '@/components/mascot/AlKo';
import type { AlKoVariant } from '@/components/mascot/AlKo';

interface ScoreDisplayProps {
  result: PromptScoreOutput;
}

const CRITERION_CONFIG: {
  key:   keyof Omit<PromptScoreOutput, 'total_score' | 'global_feedback' | 'passed'>;
  label: string;
  max:   number;
}[] = [
  { key: 'clarté_objectif',  label: 'Clarté de l\'objectif', max: 25 },
  { key: 'contexte',         label: 'Contexte',              max: 25 },
  { key: 'format_sortie',    label: 'Format de sortie',      max: 25 },
  { key: 'sécurité_données', label: 'Sécurité des données',  max: 25 },
];

type AlKoExpression = 'thumbsUp' | 'grimace' | 'lol' | 'cool';

function getAlKoReaction(score: number): { variant: AlKoVariant; expression: AlKoExpression } {
  if (score >= 90) return { variant: 'wave',      expression: 'cool'     };
  if (score === 67) return { variant: 'celebrate', expression: 'lol'      };
  if (score >= 50) return { variant: 'wave',      expression: 'thumbsUp' };
  return            { variant: 'sad',       expression: 'grimace'  };
}

function criterionColor(score: number, max: number): string {
  const pct = score / max;
  if (pct === 1)  return 'var(--color-complete)';
  if (pct >= 0.5) return 'var(--color-streak)';
  return 'var(--color-error)';
}

function totalScoreColor(score: number): string {
  if (score >= 90) return 'var(--color-complete)';
  if (score >= 50) return 'var(--color-streak)';
  return 'var(--color-error)';
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { total_score, passed, global_feedback } = result;
  const { variant: alkoVariant, expression: alkoExpr } = getAlKoReaction(total_score);
  const ringColor = totalScoreColor(total_score);

  return (
    <div className="flex flex-col gap-4">

      {/* Score global */}
      <div
        className="p-6 flex items-center gap-6"
        style={{
          background:   passed ? 'var(--color-complete-soft)' : 'var(--color-surface)',
          border:       `1px solid ${passed ? 'rgba(77,124,15,0.25)' : 'var(--color-border)'}`,
          borderRadius: '8px',
        }}
      >
        {/* Anneau SVG */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(total_score / 100) * 201} 201`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center font-semibold"
            style={{ fontSize: '1.25rem', color: ringColor }}
            aria-label={`Score : ${total_score} sur 100`}
          >
            {total_score}
          </span>
        </div>

        <div className="flex-1">
          <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)', fontSize: '1.05rem' }}>
            {passed ? 'Prompt parfait.' : `Score : ${total_score} / 100`}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
            {global_feedback}
          </p>
        </div>

        {/* Al-Ko réaction */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          className="flex-shrink-0"
        >
          <AlKo variant={alkoVariant} expression={alkoExpr} size={80} hideBubble hideName />
        </motion.div>
      </div>

      {/* Détail des 4 critères */}
      <div className="flex flex-col gap-3">
        {CRITERION_CONFIG.map(({ key, label, max }) => {
          const criterion = result[key];
          const color     = criterionColor(criterion.score, max);
          const piiFound = 'pii_found' in criterion
            ? (criterion as { score: number; feedback: string; pii_found: string[] }).pii_found
            : null;

          return (
            <div
              key={key}
              className="p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color }}>{criterion.score} / {max}</span>
              </div>

              <div
                className="w-full h-1 overflow-hidden mb-3"
                style={{ background: 'var(--color-border)', borderRadius: '2px' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${(criterion.score / max) * 100}%`, background: color, borderRadius: '2px' }}
                />
              </div>

              <p className="text-sm" style={{ color: 'var(--color-body)' }}>{criterion.feedback}</p>

              {piiFound && piiFound.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {piiFound.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs font-medium"
                      style={{
                        background:   'var(--color-error-soft)',
                        color:        'var(--color-error)',
                        border:       '1px solid rgba(185,28,28,0.2)',
                        borderRadius: '6px',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
