'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizBlock } from '@/lib/types/course';
import Confetti from '@/components/gamification/Confetti';
import { sounds } from '@/lib/sounds';

interface QuizBlockProps {
  block: QuizBlock;
  onValidate?: (correct: boolean) => void;
}

const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
};

export default function QuizBlockComponent({ block, onValidate }: QuizBlockProps) {
  const [selected,  setSelected]  = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [shaking,   setShaking]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const isCorrect = selected === block.correct_index;

  const handleSelect = useCallback((i: number) => {
    if (confirmed) return;
    sounds.click();
    setSelected(i);
  }, [confirmed]);

  const handleConfirm = useCallback(() => {
    if (selected === null) return;
    setConfirmed(true);

    if (selected === block.correct_index) {
      sounds.correct();
      setShowConf(true);
      setTimeout(() => setShowConf(false), 3000);
    } else {
      sounds.wrong();
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }

    onValidate?.(selected === block.correct_index);
  }, [selected, block.correct_index, onValidate]);

  return (
    <div className="relative">
      <Confetti active={showConf} originX={50} originY={0} count={55} />

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
              <motion.button
                key={i}
                disabled={confirmed}
                onClick={() => handleSelect(i)}
                className="w-full text-left px-4 py-3 text-sm"
                style={{
                  background:   bg,
                  border:       `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color,
                  cursor:       confirmed ? 'default' : 'pointer',
                  transition:   'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                }}
                whileHover={confirmed ? {} : { scale: 1.01, x: 3 }}
                whileTap={confirmed ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {confirmed && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
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
              <span className="font-semibold">{isCorrect ? '✓ Correct. ' : '✗ Pas tout à fait. '}</span>
              <span style={{ color: 'var(--color-body)' }}>{block.explanation}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!confirmed && (
          <motion.button
            disabled={selected === null}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-semibold"
            style={{
              background:   selected !== null ? 'var(--color-accent)' : 'var(--color-bg)',
              color:        selected !== null ? '#fff' : 'var(--color-muted)',
              cursor:       selected !== null ? 'pointer' : 'not-allowed',
              border:       `1px solid ${selected !== null ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              transition:   'background 0.2s ease',
            }}
            whileHover={selected !== null ? { scale: 1.03, y: -1 } : {}}
            whileTap={selected !== null ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            Valider ma réponse
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
