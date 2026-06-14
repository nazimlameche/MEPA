import type { PromptScoreOutput } from '@/lib/types/prompting';

interface ScoreDisplayProps {
  result: PromptScoreOutput;
}

const STEP_CONFIG = [
  { key: 'structure'     as const, label: 'Structure',       max: 33 },
  { key: 'pii_check'    as const, label: 'Données perso',   max: 33 },
  { key: 'output_format' as const, label: 'Format de sortie', max: 34 },
];

function scoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct === 1)  return 'var(--color-complete)';
  if (pct >= 0.5) return 'var(--color-streak)';
  return 'var(--color-error)';
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { total_score, passed, steps, global_feedback } = result;

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
        {/* Anneau */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke={passed ? 'var(--color-complete)' : total_score >= 50 ? 'var(--color-streak)' : 'var(--color-error)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(total_score / 100) * 201} 201`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center font-semibold"
            style={{
              fontSize: '1.25rem',
              color:    passed ? 'var(--color-complete)' : 'var(--color-ink)',
            }}
            aria-label={`Score : ${total_score} sur 100`}
          >
            {total_score}
          </span>
        </div>

        <div>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)', fontSize: '1.05rem' }}>
            {passed ? 'Prompt parfait.' : `Score : ${total_score} / 100`}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
            {global_feedback}
          </p>
        </div>
      </div>

      {/* Détail des 3 étapes */}
      <div className="flex flex-col gap-3">
        {STEP_CONFIG.map(({ key, label, max }) => {
          const step  = steps[key];
          const color = scoreColor(step.score, max);
          const pii   = key === 'pii_check' ? steps.pii_check : null;

          return (
            <div
              key={key}
              className="p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color }}>{step.score} / {max}</span>
              </div>

              <div
                className="w-full h-1 overflow-hidden mb-3"
                style={{ background: 'var(--color-border)', borderRadius: '2px' }}
              >
                <div
                  className="h-full"
                  style={{ width: `${(step.score / max) * 100}%`, background: color, borderRadius: '2px' }}
                />
              </div>

              <p className="text-sm" style={{ color: 'var(--color-body)' }}>{step.feedback}</p>

              {pii && pii.pii_found.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pii.pii_found.map((item, i) => (
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

              {'suggestions' in step && step.suggestions.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {step.suggestions.map((s, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--color-muted)' }}>
                      <span className="mt-0.5 flex-shrink-0" aria-hidden="true">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
