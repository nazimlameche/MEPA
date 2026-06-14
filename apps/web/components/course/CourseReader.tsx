'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Course } from '@/lib/types/course';
import BlockRenderer from './BlockRenderer';
import { revalidateProgress } from '@/app/actions/revalidate';

interface CourseReaderProps {
  course: Course;
}

const INTERACTIVE_TYPES = new Set(['quiz', 'fill_blank']);

export default function CourseReader({ course }: CourseReaderProps) {
  const { data: session }                     = useSession();
  const [currentBlock, setCurrentBlock]       = useState(0);
  const [unlockedUpTo, setUnlockedUpTo]       = useState(0);
  const [completed, setCompleted]             = useState(false);
  const [score, setScore]                     = useState({ correct: 0, total: 0 });

  const block         = course.blocks[currentBlock];
  const isLast        = currentBlock === course.blocks.length - 1;
  const isInteractive = INTERACTIVE_TYPES.has(block.type);
  const canContinue   = !isInteractive || unlockedUpTo >= currentBlock;

  const handleValidate = (correct: boolean) => {
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setUnlockedUpTo(currentBlock);
  };

  const goNext = async () => {
    if (isLast) {
      const token = session?.accessToken;
      if (token) {
        try {
          await fetch(
            `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/progress/courses/${course.id}/complete`,
            {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body:    JSON.stringify({
                xpReward: course.xpReward,
                score:    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 100,
              }),
            },
          );
          await revalidateProgress();
        } catch {
          // Silencieux — la complétion locale fonctionne même sans persistance
        }
      }
      setCompleted(true);
    } else {
      const next = currentBlock + 1;
      setCurrentBlock(next);
      if (!INTERACTIVE_TYPES.has(course.blocks[next].type)) setUnlockedUpTo(next);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-16 max-w-sm mx-auto">
        <div>
          <h1
            style={{
              fontSize:     '1.6rem',
              fontWeight:   600,
              marginBottom: '8px',
            }}
          >
            Leçon terminée
          </h1>
          <p style={{ color: 'var(--color-body)' }}>
            {score.total > 0
              ? `${score.correct} bonne${score.correct > 1 ? 's' : ''} réponse${score.correct > 1 ? 's' : ''} sur ${score.total}.`
              : 'Tu as lu tout le cours.'}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            background:   'var(--color-complete-soft)',
            border:       '1px solid rgba(77,124,15,0.25)',
            borderRadius: '8px',
          }}
        >
          <Zap size={16} style={{ color: 'var(--color-complete)' }} aria-hidden="true" />
          <span className="font-semibold" style={{ color: 'var(--color-complete)' }}>
            +{course.xpReward} XP
          </span>
        </div>
        <Link
          href="/modules/theory"
          className="px-8 py-3 font-semibold text-sm transition-colors duration-150"
          style={{
            background:   'var(--color-accent)',
            color:        '#fff',
            borderRadius: '8px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          Retour au parcours
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/modules/theory"
          className="flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-body)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Parcours
        </Link>
        <div className="flex-1" />
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {currentBlock + 1} / {course.blocks.length}
        </span>
      </div>

      {/* Titre + barre de blocs */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 600 }}>
          {course.title}
        </h1>
        <div className="flex gap-1 mt-4">
          {course.blocks.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 transition-colors duration-300"
              style={{
                background:   i < currentBlock
                  ? 'var(--color-complete)'
                  : i === currentBlock
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bloc courant */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlock}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <BlockRenderer block={block} onValidate={handleValidate} />
        </motion.div>
      </AnimatePresence>

      {/* Bouton Continuer */}
      <div className="flex justify-end pb-8">
        <button
          onClick={() => { void goNext(); }}
          disabled={!canContinue}
          className="px-7 py-3 font-semibold text-sm transition-colors duration-150"
          style={{
            background:   canContinue ? 'var(--color-accent)' : 'var(--color-bg)',
            color:        canContinue ? '#fff' : 'var(--color-muted)',
            cursor:       canContinue ? 'pointer' : 'not-allowed',
            border:       `1px solid ${canContinue ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: '8px',
          }}
          onMouseEnter={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-accent)'; }}
        >
          {isLast ? 'Terminer la leçon' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
