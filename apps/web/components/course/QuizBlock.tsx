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
      className="rounded-2xl p-6"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <div className="flex items-start gap-3 mb-5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(76,31,212,0.2)', color: 'var(--color-primary-light)' }}
        >
          ?
        </span>
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {block.question}
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {block.options.map((option, i) => {
          let borderColor = 'var(--color-surface-border)';
          let bg = 'rgba(255,255,255,0.03)';
          let color = 'var(--color-text-secondary)';

          if (confirmed) {
            if (i === block.correct_index) {
              borderColor = 'rgba(16,185,129,0.5)';
              bg = 'rgba(16,185,129,0.1)';
              color = '#10B981';
            } else if (i === selected && !isCorrect) {
              borderColor = 'rgba(239,68,68,0.5)';
              bg = 'rgba(239,68,68,0.08)';
              color = 'var(--color-danger)';
            }
          } else if (i === selected) {
            borderColor = 'var(--color-primary)';
            bg = 'rgba(76,31,212,0.12)';
            color = 'var(--color-text-primary)';
          }

          return (
            <button
              key={i}
              disabled={confirmed}
              onClick={() => !confirmed && setSelected(i)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors duration-150"
              style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                color,
                cursor: confirmed ? 'default' : 'pointer',
              }}
            >
              <span
                className="inline-flex w-5 h-5 rounded-md items-center justify-center text-xs font-semibold mr-2 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)' }}
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
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{
            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: isCorrect ? '#10B981' : 'var(--color-danger)',
          }}
        >
          <span className="font-semibold">{isCorrect ? '✅ Correct ! ' : '❌ Pas tout à fait. '}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{block.explanation}</span>
        </div>
      )}

      {!confirmed && (
        <button
          disabled={selected === null}
          onClick={handleConfirm}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
          style={{
            background: selected !== null ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
            color: selected !== null ? '#fff' : 'var(--color-text-muted)',
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            border: '1px solid transparent',
          }}
        >
          Valider ma réponse
        </button>
      )}
    </div>
  );
}
