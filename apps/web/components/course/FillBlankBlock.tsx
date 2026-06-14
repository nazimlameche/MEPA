'use client';

import { useState } from 'react';
import type { FillBlankBlock } from '@/lib/types/course';

interface FillBlankProps {
  block: FillBlankBlock;
  onValidate?: (correct: boolean) => void;
}

export default function FillBlankBlockComponent({ block, onValidate }: FillBlankProps) {
  const [value, setValue]         = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showHint, setShowHint]   = useState(false);

  const isCorrect = value.trim().toLowerCase() === block.blank_word.toLowerCase();

  const handleConfirm = () => {
    if (!value.trim()) return;
    setConfirmed(true);
    onValidate?.(isCorrect);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  const parts = block.sentence.split('___');

  return (
    <div
      className="p-6"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <p className="text-sm font-medium mb-5" style={{ color: 'var(--color-muted)' }}>
        Complète la phrase
      </p>

      <p
        className="text-base leading-relaxed mb-5 flex flex-wrap items-center gap-1"
        style={{ color: 'var(--color-ink)' }}
      >
        <span>{parts[0]}</span>
        <input
          type="text"
          value={confirmed ? block.blank_word : value}
          onChange={e => !confirmed && setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={confirmed}
          placeholder="..."
          aria-label="Mot manquant"
          className="inline-block px-3 py-1 text-sm outline-none text-center transition-colors duration-200"
          style={{
            width:        `${Math.max(block.blank_word.length + 4, 8)}ch`,
            background:   confirmed
              ? (isCorrect ? 'var(--color-complete-soft)' : 'var(--color-error-soft)')
              : 'var(--color-bg)',
            border:       `1px solid ${
              confirmed
                ? (isCorrect ? 'var(--color-complete)' : 'var(--color-error)')
                : 'var(--color-border)'
            }`,
            borderRadius: '6px',
            color:        confirmed
              ? (isCorrect ? 'var(--color-complete)' : 'var(--color-error)')
              : 'var(--color-ink)',
          }}
          onFocus={e => { if (!confirmed) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
          onBlur={e => { if (!confirmed) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        />
        {parts[1] && <span>{parts[1]}</span>}
      </p>

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
          {isCorrect
            ? 'Bonne réponse.'
            : `La bonne réponse était : "${block.blank_word}"`}
        </div>
      )}

      {!confirmed && (
        <div className="flex items-center gap-3">
          <button
            disabled={!value.trim()}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-semibold transition-colors duration-200"
            style={{
              background:   value.trim() ? 'var(--color-accent)' : 'var(--color-bg)',
              color:        value.trim() ? '#fff' : 'var(--color-muted)',
              cursor:       value.trim() ? 'pointer' : 'not-allowed',
              border:       `1px solid ${value.trim() ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '8px',
            }}
            onMouseEnter={e => { if (value.trim()) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
            onMouseLeave={e => { if (value.trim()) e.currentTarget.style.background = 'var(--color-accent)'; }}
          >
            Valider
          </button>
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-body)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              Voir un indice
            </button>
          )}
          {showHint && (
            <span className="text-sm" style={{ color: 'var(--color-accent)' }}>
              Indice : {block.hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
