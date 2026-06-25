'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Course } from '@/lib/types/course';
import BlockRenderer from './BlockRenderer';
import { revalidateProgress } from '@/app/actions/revalidate';
import { sounds } from '@/lib/sounds';
import Confetti from '@/components/gamification/Confetti';
import AlKo from '@/components/mascot/AlKo';
import { COMPLETION_MESSAGES } from '@/lib/completion-messages';

interface CourseReaderProps {
  course: Course;
}

const INTERACTIVE_TYPES = new Set(['quiz', 'fill_blank']);
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export default function CourseReader({ course }: CourseReaderProps) {
  const { data: session }               = useSession();
  const [currentBlock, setCurrentBlock] = useState(0);
  const [unlockedUpTo, setUnlockedUpTo] = useState(0);
  const [completed, setCompleted]       = useState(false);
  const [score, setScore]               = useState({ correct: 0, total: 0 });
  const [completionMsg]                 = useState(
    () => COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)],
  );

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    fetch(`${API_BASE}/api/progress/courses/${course.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: { status?: string; currentBlock?: number } | null) => {
        if (data?.status === 'in_progress' && typeof data.currentBlock === 'number' && data.currentBlock > 0) {
          setCurrentBlock(data.currentBlock);
          setUnlockedUpTo(data.currentBlock);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // Son de victoire à la complétion
  useEffect(() => {
    if (completed) sounds.victory();
  }, [completed]);

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
          await fetch(`${API_BASE}/api/progress/courses/${course.id}/complete`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({
              xpReward: course.xpReward,
              score:    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 100,
            }),
          });
          await revalidateProgress();
        } catch {}
      }
      setCompleted(true);
    } else {
      const next = currentBlock + 1;
      setCurrentBlock(next);
      if (!INTERACTIVE_TYPES.has(course.blocks[next].type)) setUnlockedUpTo(next);
      const token = session?.accessToken;
      if (token) {
        fetch(`${API_BASE}/api/progress/courses/${course.id}/position`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentBlock: next }),
        }).catch(() => {});
      }
    }
  };

  if (completed) {
    return (
      <div className="relative">
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
          <Confetti active={true} originX={50} originY={25} count={80} />
        </div>

        <motion.div
          className="flex flex-col items-center text-center gap-6 py-16 max-w-sm mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Mascotte Al-Ko en mode célébration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.15 }}
          >
            <AlKo variant="celebrate" size={130} bubble={completionMsg} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          >
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '8px' }}>
              Leçon terminée 🎉
            </h1>
            <p style={{ color: 'var(--color-body)' }}>
              {score.total > 0
                ? `${score.correct} bonne${score.correct > 1 ? 's' : ''} réponse${score.correct > 1 ? 's' : ''} sur ${score.total}.`
                : 'Tu as lu tout le cours.'}
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-5 py-3"
            style={{
              background:   'var(--color-complete-soft)',
              border:       '1px solid rgba(77,124,15,0.25)',
              borderRadius: '8px',
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.25 }}
          >
            <Zap size={16} style={{ color: 'var(--color-complete)' }} aria-hidden="true" />
            <span className="font-semibold" style={{ color: 'var(--color-complete)', fontSize: '1.1rem' }}>
              +{course.xpReward} XP
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.4 }}
          >
            <Link
              href="/modules/custom-course"
              className="px-8 py-3 font-semibold text-sm text-white inline-block"
              style={{ background: 'var(--color-accent)', borderRadius: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
              onClick={() => sounds.click()}
            >
              Retour au cours
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/modules/custom-course"
          className="flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-body)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Cours sur mesure
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
          onClick={() => { if (canContinue) sounds.click(); void goNext(); }}
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
