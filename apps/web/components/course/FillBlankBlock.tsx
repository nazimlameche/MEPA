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
      className="rounded-2xl p-6"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-streak)' }}
        >
          ✏️
        </span>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Complète la phrase
        </p>
      </div>

      <p
        className="text-base leading-relaxed mb-5 flex flex-wrap items-center gap-1"
        style={{ color: 'var(--color-text-primary)' }}
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
          className="inline-block px-3 py-1 rounded-lg text-sm outline-none text-center transition-colors duration-200"
          style={{
            width: `${Math.max(block.blank_word.length + 4, 8)}ch`,
            background: confirmed
              ? (isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)')
              : 'rgba(255,255,255,0.07)',
            border: `1px solid ${
              confirmed
                ? (isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)')
                : 'rgba(255,255,255,0.15)'
            }`,
            color: confirmed
              ? (isCorrect ? '#10B981' : 'var(--color-danger)')
              : 'var(--color-text-primary)',
          }}
        />
        {parts[1] && <span>{parts[1]}</span>}
      </p>

      {confirmed && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{
            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: isCorrect ? '#10B981' : 'var(--color-danger)',
          }}
        >
          {isCorrect
            ? '✅ Bonne réponse !'
            : `❌ La bonne réponse était : "${block.blank_word}"`}
        </div>
      )}

      {!confirmed && (
        <div className="flex items-center gap-3">
          <button
            disabled={!value.trim()}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
            style={{
              background: value.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              color: value.trim() ? '#fff' : 'var(--color-text-muted)',
              cursor: value.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Valider
          </button>
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              Voir un indice
            </button>
          )}
          {showHint && (
            <span className="text-sm" style={{ color: 'var(--color-streak)' }}>
              💡 {block.hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
