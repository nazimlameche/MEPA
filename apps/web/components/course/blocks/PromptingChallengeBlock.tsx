'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import type { PromptingChallengeBlock } from '@/lib/types/course';

interface Props {
  block: PromptingChallengeBlock;
}

export default function PromptingChallengeBlockComponent({ block }: Props) {
  const [prompt, setPrompt]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background:   'rgba(255,255,255,0.03)',
        border:       '1px solid var(--color-surface-border)',
        borderRadius: '12px',
        padding:      '20px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Badge numéro */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="flex items-center justify-center text-sm font-bold"
          style={{
            width:        '28px',
            height:       '28px',
            borderRadius: '50%',
            background:   'var(--color-primary)',
            color:        '#fff',
            flexShrink:   0,
          }}
        >
          {block.numero}
        </span>
        <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
          {block.titre}
        </h3>
      </div>

      {/* Consigne */}
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
        {block.consigne}
      </p>

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder="Écris ton prompt ici…"
        disabled={submitted}
        style={{
          width:        '100%',
          padding:      '12px',
          borderRadius: '8px',
          border:       '1px solid var(--color-surface-border)',
          background:   'rgba(255,255,255,0.04)',
          color:        'var(--color-text-primary)',
          fontSize:     '0.9rem',
          resize:       'vertical',
          outline:      'none',
          opacity:      submitted ? 0.6 : 1,
        }}
      />
      <div className="flex justify-between items-center mt-1 mb-4">
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {prompt.length}/500
        </span>
      </div>

      {/* Bouton submit */}
      {!submitted && (
        <button
          onClick={() => { if (prompt.trim()) setSubmitted(true); }}
          disabled={!prompt.trim()}
          className="px-5 py-2.5 font-semibold text-sm transition-colors duration-150"
          style={{
            background:   prompt.trim() ? 'var(--color-primary)' : 'var(--color-surface-card)',
            color:        prompt.trim() ? '#fff' : 'var(--color-text-muted)',
            borderRadius: '8px',
            cursor:       prompt.trim() ? 'pointer' : 'not-allowed',
            border:       '1px solid transparent',
          }}
        >
          Soumettre mon prompt
        </button>
      )}

      {/* Bandeau de succès */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3 px-4 py-3 mt-2"
            style={{
              background:   'rgba(16, 185, 129, 0.1)',
              border:       '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: 'var(--color-xp)', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-xp)', fontSize: '0.9rem', fontWeight: 500 }}>
                Bravo ! Essaie maintenant dans l&apos;Atelier Prompting
              </span>
            </div>
            <Link
              href="/modules/prompting"
              className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-xp)', whiteSpace: 'nowrap' }}
            >
              Aller à l&apos;atelier <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
