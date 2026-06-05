'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import type { Course } from '@/lib/types/course';
import BlockRenderer from './BlockRenderer';

interface CourseReaderProps {
  course: Course;
}

const INTERACTIVE_TYPES = new Set(['quiz', 'fill_blank']);

export default function CourseReader({ course }: CourseReaderProps) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [unlockedUpTo, setUnlockedUpTo] = useState(0);
  const [completed, setCompleted]       = useState(false);
  const [score, setScore]               = useState({ correct: 0, total: 0 });

  const block         = course.blocks[currentBlock];
  const isLast        = currentBlock === course.blocks.length - 1;
  const isInteractive = INTERACTIVE_TYPES.has(block.type);
  const canContinue   = !isInteractive || unlockedUpTo >= currentBlock;

  const handleValidate = (correct: boolean) => {
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    setUnlockedUpTo(currentBlock);
  };

  const goNext = () => {
    if (isLast) {
      setCompleted(true);
    } else {
      const next = currentBlock + 1;
      setCurrentBlock(next);
      if (!INTERACTIVE_TYPES.has(course.blocks[next].type)) {
        setUnlockedUpTo(next);
      }
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 py-16 px-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          🎉
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}
          >
            Cours terminé !
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {score.total > 0
              ? `Tu as répondu correctement à ${score.correct} question${score.correct > 1 ? 's' : ''} sur ${score.total}.`
              : 'Tu as lu tout le cours.'}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-5 py-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <Zap size={18} style={{ color: 'var(--color-xp)' }} aria-hidden="true" />
          <span className="font-semibold" style={{ color: '#10B981' }}>
            +{course.xpReward} XP gagnés
          </span>
        </div>
        <Link
          href="/modules/theory"
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Retour au parcours
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/modules/theory"
          className="flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Parcours
        </Link>
        <div className="flex-1" />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {currentBlock + 1} / {course.blocks.length}
        </span>
      </div>

      {/* Titre + barre blocs */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {course.title}
        </h1>
        <div className="flex gap-1 mt-4">
          {course.blocks.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors duration-300"
              style={{
                background: i <= currentBlock
                  ? 'var(--color-primary-light)'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bloc courant */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlock}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <BlockRenderer block={block} onValidate={handleValidate} />
        </motion.div>
      </AnimatePresence>

      {/* Bouton Continuer */}
      <div className="flex justify-end pb-8">
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="px-7 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
          style={{
            background: canContinue ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
            color: canContinue ? '#fff' : 'var(--color-text-muted)',
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-primary-light)'; }}
          onMouseLeave={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-primary)'; }}
        >
          {isLast ? 'Terminer le cours 🎉' : 'Continuer →'}
        </button>
      </div>
    </div>
  );
}
