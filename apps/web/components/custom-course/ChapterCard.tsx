'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Loader2, Lock } from 'lucide-react';
import type { ParcoursChapter, ChapterMeta } from '@/lib/types/custom-course';

interface ChapterCardProps {
  chapter:   ParcoursChapter;
  meta:      ChapterMeta;
  parcoursId: string;
  index:     number;
}

export default function ChapterCard({ chapter, meta, parcoursId, index }: ChapterCardProps) {
  const router = useRouter();

  const navigate = () => router.push(`/modules/custom-course/${parcoursId}/${meta.index}`);

  const isCompleted  = chapter.status === 'completed';
  const isError      = chapter.status === 'error';
  const isGenerating = chapter.status === 'generating';
  const isPending    = chapter.status === 'pending';
  const isReady      = chapter.status === 'ready';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      onClick={navigate}
      className="relative overflow-hidden cursor-pointer transition-all duration-200 p-4"
      style={{
        background:   'var(--color-surface-card)',
        border:       `1px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : isError ? 'rgba(239,68,68,0.3)' : 'var(--color-surface-border)'}`,
        borderRadius: '12px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isCompleted
          ? 'rgba(16,185,129,0.5)'
          : isError
          ? 'rgba(239,68,68,0.5)'
          : 'var(--color-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isCompleted
          ? 'rgba(16,185,129,0.3)'
          : isError
          ? 'rgba(239,68,68,0.3)'
          : 'var(--color-surface-border)';
      }}
    >
      {/* Completed overlay */}
      {isCompleted && (
        <div
          className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none"
          style={{ background: 'rgba(16,185,129,0.04)' }}
        >
          <Check size={14} style={{ color: 'rgba(16,185,129,0.5)' }} />
        </div>
      )}

      {/* Icon + status */}
      <div className="flex items-start justify-between mb-3">
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{meta.icon}</span>
        <StatusBadge chapter={chapter} meta={meta} />
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium leading-snug"
        style={{
          color:     isCompleted ? 'rgba(240,238,255,0.7)' : 'var(--color-text-primary)',
          textDecoration: isCompleted ? 'none' : 'none',
        }}
      >
        {(isReady || isCompleted) && chapter.title ? chapter.title : meta.defaultTitle}
      </p>

      {/* Pending lock hint */}
      {isPending && (
        <div className="flex items-center gap-1 mt-2">
          <Lock size={10} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            Généré à l'ouverture
          </span>
        </div>
      )}

      {/* Generating spinner */}
      {isGenerating && (
        <div className="flex items-center gap-1.5 mt-2">
          <Loader2 size={10} className="animate-spin" style={{ color: 'var(--color-primary-light)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>En cours…</span>
        </div>
      )}

      {/* Error retry hint */}
      {isError && (
        <p style={{ fontSize: '0.7rem', color: 'var(--color-danger)', marginTop: '4px' }}>
          Clique pour réessayer
        </p>
      )}
    </motion.div>
  );
}

function StatusBadge({ chapter, meta }: { chapter: ParcoursChapter; meta: ChapterMeta }) {
  const { status, xpEarned } = chapter;

  if (status === 'completed') {
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5"
        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '6px' }}
      >
        +{xpEarned} XP ✓
      </span>
    );
  }
  if (status === 'ready') {
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5"
        style={{ background: 'rgba(76,31,212,0.15)', color: 'var(--color-primary-light)', borderRadius: '6px' }}
      >
        +{meta.xpReward} XP
      </span>
    );
  }
  if (status === 'error') {
    return (
      <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />
    );
  }
  return (
    <span
      className="text-xs px-2 py-0.5"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', borderRadius: '6px' }}
    >
      À découvrir
    </span>
  );
}
