'use client';

import { useState } from 'react';
import type { QuizBlock } from '@/lib/types/course';

interface QuizBlockProps {
  block: QuizBlock;
  onValidate?: (correct: boolean) => void;
}

export default function QuizBlockComponent({ block, onValidate }: QuizBlockProps) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const isCorrect = selected === block.correct_index;

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    onValidate?.(isCorrect);
  };

  return (
    <div
      className="p-6"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <p className="font-semibold mb-5" style={{ color: 'var(--color-ink)' }}>
        {block.question}
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {block.options.map((option, i) => {
          let borderColor = 'var(--color-border)';
          let bg          = 'var(--color-surface)';
          let color       = 'var(--color-body)';

          if (confirmed) {
            if (i === block.correct_index) {
              borderColor = 'var(--color-complete)';
              bg          = 'var(--color-complete-soft)';
              color       = 'var(--color-complete)';
            } else if (i === selected && !isCorrect) {
              borderColor = 'var(--color-error)';
              bg          = 'var(--color-error-soft)';
              color       = 'var(--color-error)';
            }
          } else if (i === selected) {
            borderColor = 'var(--color-accent)';
            bg          = 'var(--color-accent-soft)';
            color       = 'var(--color-accent)';
          }

          return (
            <button
              key={i}
              disabled={confirmed}
              onClick={() => !confirmed && setSelected(i)}
              className="w-full text-left px-4 py-3 text-sm transition-colors duration-150"
              style={{
                background:   bg,
                border:       `1px solid ${borderColor}`,
                borderRadius: '8px',
                color,
                cursor:       confirmed ? 'default' : 'pointer',
              }}
            >
              <span
                className="inline-flex w-5 h-5 items-center justify-center text-xs font-semibold mr-2 flex-shrink-0"
                style={{
                  background:   'var(--color-border)',
                  borderRadius: '4px',
                  color:        'var(--color-muted)',
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {confirmed && (
        <div
          className="px-4 py-3 text-sm mb-4"
          style={{
            background:   isCorrect ? 'var(--color-complete-soft)' : 'var(--color-error-soft)',
            border:       `1px solid ${isCorrect ? 'rgba(77,124,15,0.25)' : 'rgba(185,28,28,0.25)'}`,
            color:        isCorrect ? 'var(--color-complete)' : 'var(--color-error)',
            borderRadius: '8px',
          }}
        >
          <span className="font-semibold">{isCorrect ? 'Correct. ' : 'Pas tout à fait. '}</span>
          <span style={{ color: 'var(--color-body)' }}>{block.explanation}</span>
        </div>
      )}

      {!confirmed && (
        <button
          disabled={selected === null}
          onClick={handleConfirm}
          className="px-5 py-2.5 text-sm font-semibold transition-colors duration-200"
          style={{
            background:   selected !== null ? 'var(--color-accent)' : 'var(--color-bg)',
            color:        selected !== null ? '#fff' : 'var(--color-muted)',
            cursor:       selected !== null ? 'pointer' : 'not-allowed',
            border:       `1px solid ${selected !== null ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: '8px',
          }}
          onMouseEnter={e => { if (selected !== null) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={e => { if (selected !== null) e.currentTarget.style.background = 'var(--color-accent)'; }}
        >
          Valider ma réponse
        </button>
      )}
    </div>
  );
}
