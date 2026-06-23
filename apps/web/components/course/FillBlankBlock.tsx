'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FillBlankBlock } from '@/lib/types/course';
import Confetti from '@/components/gamification/Confetti';
import { sounds } from '@/lib/sounds';

interface FillBlankProps {
  block: FillBlankBlock;
  onValidate?: (correct: boolean) => void;
}

const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: 'easeInOut' as const },
  },
};

export default function FillBlankBlockComponent({ block, onValidate }: FillBlankProps) {
  const [value,     setValue]     = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showHint,  setShowHint]  = useState(false);
  const [shaking,   setShaking]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const isCorrect = value.trim().toLowerCase() === block.blank_word.toLowerCase();

  const handleConfirm = useCallback(() => {
    if (!value.trim()) return;
    setConfirmed(true);

    if (value.trim().toLowerCase() === block.blank_word.toLowerCase()) {
      sounds.correct();
      setShowConf(true);
      setTimeout(() => setShowConf(false), 3000);
    } else {
      sounds.wrong();
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }

    onValidate?.(value.trim().toLowerCase() === block.blank_word.toLowerCase());
  }, [value, block.blank_word, onValidate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  const parts = block.sentence.split('___');

  return (
    <div className="relative">
      <Confetti active={showConf} originX={50} originY={0} count={45} />

      <motion.div
        variants={shakeVariants}
        animate={shaking ? 'shake' : 'idle'}
        className="p-6"
        style={{
          background:   'var(--color-surface)',
          border:       `1px solid ${confirmed && !isCorrect ? 'var(--color-error)' : confirmed && isCorrect ? 'var(--color-complete)' : 'var(--color-border)'}`,
          borderRadius: '8px',
          transition:   'border-color 0.3s ease',
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
          <motion.input
            type="text"
            value={confirmed ? block.blank_word : value}
            onChange={e => !confirmed && setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={confirmed}
            placeholder="..."
            aria-label="Mot manquant"
            className="inline-block px-3 py-1 text-sm outline-none text-center"
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
              transition:   'background 0.2s, border-color 0.2s, color 0.2s',
            }}
            onFocus={e => { if (!confirmed) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={e => { if (!confirmed) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            animate={confirmed && isCorrect ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
          {parts[1] && <span>{parts[1]}</span>}
        </p>

        <AnimatePresence>
          {confirmed && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="px-4 py-3 text-sm mb-4"
              style={{
                background:   isCorrect ? 'var(--color-complete-soft)' : 'var(--color-error-soft)',
                border:       `1px solid ${isCorrect ? 'rgba(77,124,15,0.25)' : 'rgba(185,28,28,0.25)'}`,
                color:        isCorrect ? 'var(--color-complete)' : 'var(--color-error)',
                borderRadius: '8px',
              }}
            >
              {isCorrect
                ? '✓ Bonne réponse.'
                : `✗ La bonne réponse était : "${block.blank_word}"`}
            </motion.div>
          )}
        </AnimatePresence>

        {!confirmed && (
          <div className="flex items-center gap-3">
            <motion.button
              disabled={!value.trim()}
              onClick={handleConfirm}
              className="px-5 py-2.5 text-sm font-semibold"
              style={{
                background:   value.trim() ? 'var(--color-accent)' : 'var(--color-bg)',
                color:        value.trim() ? '#fff' : 'var(--color-muted)',
                cursor:       value.trim() ? 'pointer' : 'not-allowed',
                border:       `1px solid ${value.trim() ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                transition:   'background 0.2s ease',
              }}
              whileHover={value.trim() ? { scale: 1.03, y: -1 } : {}}
              whileTap={value.trim() ? { scale: 0.97 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Valider
            </motion.button>

            <AnimatePresence>
              {!showHint && (
                <motion.button
                  onClick={() => setShowHint(true)}
                  className="text-sm"
                  style={{ color: 'var(--color-muted)' }}
                  whileHover={{ color: 'var(--color-body)' } as never}
                  exit={{ opacity: 0, x: -4 }}
                >
                  Voir un indice
                </motion.button>
              )}
              {showHint && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Indice : {block.hint}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
