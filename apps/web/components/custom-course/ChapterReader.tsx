'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { revalidateProgress } from '@/app/actions/revalidate';
import BlockRenderer from '@/components/course/BlockRenderer';
import AlKo from '@/components/mascot/AlKo';
import AikoChat from '@/components/aiko/AikoChat';
import { sounds } from '@/lib/sounds';
import { COMPLETION_MESSAGES } from '@/lib/completion-messages';
import type { ParcoursChapter } from '@/lib/types/custom-course';

/** Sérialise les blocs en texte lisible pour le contexte AIKO.
 *  Ne révèle pas les réponses correctes des quiz / mots manquants. */
function serializeChapterContext(chapter: ParcoursChapter): string {
  if (!chapter.content?.blocks) return '';
  const lines: string[] = [`Titre : ${chapter.content.title ?? chapter.title}`];
  for (const block of chapter.content.blocks) {
    switch (block.type) {
      case 'text':
        lines.push(`[Texte] ${block.content}`);
        break;
      case 'tip':
        lines.push(`[Astuce] ${block.content}`);
        break;
      case 'story':
        lines.push(`[Histoire] ${block.title} — ${block.narrative}`);
        break;
      case 'quiz':
        lines.push(`[Quiz] ${block.question}\nOptions : ${block.options.join(' / ')}`);
        // correct_index volontairement omis
        break;
      case 'fill_blank':
        lines.push(`[Texte à trous] ${block.sentence.replace('___', '___')}`);
        // blank_word volontairement omis
        break;
    }
  }
  return lines.join('\n');
}

interface ChapterReaderProps {
  chapter:    ParcoursChapter;
  parcoursId: string;
}

const INTERACTIVE_TYPES = new Set(['quiz', 'fill_blank']);

export default function ChapterReader({ chapter, parcoursId }: ChapterReaderProps) {
  const { data: session }                = useSession();
  const blocks                            = chapter.content!.blocks;
  const aikoContext                       = useMemo(() => serializeChapterContext(chapter), [chapter]);
  const [currentBlock, setCurrentBlock]  = useState(0);
  const [unlockedUpTo, setUnlockedUpTo]  = useState(0);
  const [completed, setCompleted]        = useState(chapter.status === 'completed');
  const [xpEarned, setXpEarned]          = useState(chapter.xpEarned);
  const [score, setScore]                = useState({ correct: 0, total: 0 });
  const [completionMsg]                  = useState(
    () => COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)],
  );

  const block         = blocks[currentBlock];
  const isLast        = currentBlock === blocks.length - 1;
  const isInteractive = INTERACTIVE_TYPES.has(block.type);
  const canContinue   = !isInteractive || unlockedUpTo >= currentBlock;

  const handleValidate = (correct: boolean) => {
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setUnlockedUpTo(currentBlock);
  };

  const goNext = async () => {
    if (!isLast) {
      const next = currentBlock + 1;
      setCurrentBlock(next);
      if (!INTERACTIVE_TYPES.has(blocks[next].type)) setUnlockedUpTo(next);
      return;
    }

    const token = session?.accessToken;
    if (token) {
      try {
        const result = await apiClient.post<{ xpEarned: number }>(
          `/custom-course/chapters/${chapter.id}/complete`,
          {},
          token,
        );
        setXpEarned(result.xpEarned);
        await revalidateProgress();
      } catch (err) {
        console.error('[ChapterReader] complete', err);
        toast.error("Impossible d'enregistrer la progression. Réessaie.");
      }
    }
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-16 max-w-sm mx-auto">
        <AlKo variant="celebrate" size={130} bubble={completionMsg} hideName bubbleOffsetX={-80} bubbleOffsetY={50} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Chapitre terminé !
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {score.total > 0
            ? `${score.correct} bonne${score.correct > 1 ? 's' : ''} réponse${score.correct > 1 ? 's' : ''} sur ${score.total}.`
            : 'Tu as lu tout le chapitre.'}
        </p>
        {xpEarned > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center gap-2 px-5 py-3"
            style={{
              background:   'rgba(16,185,129,0.1)',
              border:       '1px solid rgba(16,185,129,0.25)',
              borderRadius: '8px',
            }}
          >
            <Zap size={16} style={{ color: '#10B981' }} />
            <span className="font-semibold" style={{ color: '#10B981' }}>
              +{xpEarned} XP
            </span>
          </motion.div>
        )}
        <Link
          href={`/modules/custom-course/${parcoursId}`}
          className="px-8 py-3 font-semibold text-sm transition-colors duration-150"
          style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '8px' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          onClick={() => sounds.click()}
        >
          Retour au parcours
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* AIKO — assistant flottant contextuel */}
      <AikoChat context={aikoContext} chapterTitle={chapter.content?.title ?? chapter.title} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/modules/custom-course/${parcoursId}`}
          className="flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <ArrowLeft size={15} />
          Parcours
        </Link>
        <div className="flex-1" />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {currentBlock + 1} / {blocks.length}
        </span>
      </div>

      {/* Title + block progress */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {chapter.content!.title || chapter.title}
        </h1>
        <div className="flex gap-1 mt-4">
          {blocks.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 transition-colors duration-300"
              style={{
                background:   i < currentBlock
                  ? '#10B981'
                  : i === currentBlock
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-border)',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Current block */}
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

      {/* Continue button */}
      <div className="flex justify-end pb-8">
        <button
          onClick={() => { if (canContinue) sounds.click(); void goNext(); }}
          disabled={!canContinue}
          className="px-7 py-3 font-semibold text-sm transition-colors duration-150"
          style={{
            background:   canContinue ? 'var(--color-primary)' : 'var(--color-surface-card)',
            color:        canContinue ? '#fff' : 'var(--color-text-muted)',
            cursor:       canContinue ? 'pointer' : 'not-allowed',
            border:       `1px solid ${canContinue ? 'var(--color-primary)' : 'var(--color-surface-border)'}`,
            borderRadius: '8px',
          }}
          onMouseEnter={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-primary-light)'; }}
          onMouseLeave={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-primary)'; }}
        >
          {isLast ? 'Terminer le chapitre' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
