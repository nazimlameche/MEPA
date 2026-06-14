'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ContentBlock } from '@/types';

interface QuizWidgetProps {
  block: ContentBlock;
  courseId: string;
}

export default function QuizWidget({ block, courseId: _courseId }: QuizWidgetProps) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options   = block.options ?? [];
  const correct   = block.correctIndex ?? 0;
  const isCorrect = selected === correct;

  function optionStyle(i: number): React.CSSProperties {
    if (!submitted) {
      return selected === i
        ? { background: 'var(--color-accent-soft)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '8px' }
        : { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-body)', borderRadius: '8px' };
    }
    if (i === correct)  return { background: 'var(--color-complete-soft)', border: '1px solid var(--color-complete)', color: 'var(--color-complete)', borderRadius: '8px' };
    if (i === selected) return { background: 'var(--color-error-soft)', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: '8px' };
    return { background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', opacity: 0.5 };
  }

  return (
    <div
      className="p-5 space-y-4"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>
        {block.content}
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            className="px-4 py-2.5 text-sm text-left w-full transition-colors duration-150"
            style={optionStyle(i)}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
            onMouseEnter={e => {
              if (!submitted && selected !== i)
                e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={e => {
              if (!submitted && selected !== i)
                e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {!submitted && selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="px-5 py-2 text-sm font-semibold transition-colors duration-150"
          style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', border: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          Valider
        </button>
      )}

      {submitted && (
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: isCorrect ? 'var(--color-complete)' : 'var(--color-error)' }}>
          {isCorrect
            ? <CheckCircle className="h-4 w-4" aria-hidden="true" />
            : <XCircle className="h-4 w-4" aria-hidden="true" />
          }
          {isCorrect ? 'Correct. +10 XP' : `Pas tout à fait. ${block.explanation ?? ''}`}
        </div>
      )}
    </div>
  );
}
