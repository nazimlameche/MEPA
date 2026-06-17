'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { ParcoursChapter, GeneratedChapterContent } from '@/lib/types/custom-course';
import ChapterReader from './ChapterReader';

interface LazyChapterLoaderProps {
  chapter:    ParcoursChapter;
  parcoursId: string;
}

type LoadState = 'loading' | 'done' | 'error';

export default function LazyChapterLoader({ chapter, parcoursId }: LazyChapterLoaderProps) {
  const [state, setState]     = useState<LoadState>('loading');
  const [content, setContent] = useState<GeneratedChapterContent | null>(null);
  const [attempt, setAttempt] = useState(0);

  const generate = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/custom-course/chapters/${chapter.id}/generate`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { content: GeneratedChapterContent };
      setContent(data.content);
      setState('done');
    } catch (err) {
      console.error('[LazyChapterLoader] generate', err);
      setState('error');
    }
  }, [chapter.id]);

  useEffect(() => {
    void generate();
  }, [generate, attempt]);

  if (state === 'done' && content) {
    return (
      <ChapterReader
        chapter={{ ...chapter, content, status: 'ready' }}
        parcoursId={parcoursId}
      />
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>
          La génération a échoué. Vérifie ta connexion et réessaie.
        </p>
        <button
          onClick={() => setAttempt(a => a + 1)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors duration-200"
          style={{
            border:       '1px solid var(--color-primary)',
            borderRadius: '8px',
            color:        'var(--color-primary-light)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(76,31,212,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      </div>
    );
  }

  // Loading skeleton
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2 mb-6">
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-5 w-2/3"
          style={{ background: 'var(--color-surface-card)', borderRadius: '6px' }}
        />
      </div>

      {[0.8, 0.6, 1, 0.7, 0.9].map((width, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          style={{
            height:     i === 2 ? '80px' : '36px',
            width:      `${width * 100}%`,
            background: 'var(--color-surface-card)',
            borderRadius: '8px',
          }}
        />
      ))}

      <p
        className="text-center text-sm mt-6"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Génération de ton chapitre personnalisé…
      </p>
    </div>
  );
}
