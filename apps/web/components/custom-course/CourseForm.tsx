'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolLevel, GeneratedCourseOutput } from '@/lib/types/custom-course';

type FormStep = 'interest' | 'level' | 'generating';

interface CourseFormProps {
  onGenerated: (course: GeneratedCourseOutput) => void;
}

const LEVELS: { value: SchoolLevel; label: string; desc: string }[] = [
  { value: 'college', label: 'Collège',    desc: '11 – 15 ans' },
  { value: 'lycee',   label: 'Lycée',      desc: '15 – 18 ans' },
  { value: 'adulte',  label: 'Université', desc: '18 ans et +' },
];

const INTEREST_SUGGESTIONS = [
  'Football', 'Manga', 'Musique', 'Jeux vidéo',
  'Cuisine', 'Cinéma', 'Sciences', 'Voyage',
];

export default function CourseForm({ onGenerated }: CourseFormProps) {
  const [step, setStep]         = useState<FormStep>('interest');
  const [interest, setInterest] = useState('');
  const [level, setLevel]       = useState<SchoolLevel | ''>('');
  const [error, setError]       = useState('');

  const handleGenerate = async () => {
    if (!interest.trim() || !level) return;
    setError('');
    setStep('generating');

    try {
      const res = await fetch('/api/custom-course/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          interest: interest.trim(),
          level,
          context: "Module M4 — Cours Sur-Mesure. Plateforme AI-Edu, enseignement de l'IA pour jeunes.",
        }),
      });

      const data = await res.json() as GeneratedCourseOutput & { message?: string };

      if (!res.ok) {
        setError(data.message ?? 'Une erreur est survenue.');
        setStep('level');
        return;
      }

      onGenerated(data);
    } catch {
      setError('Impossible de contacter le serveur. Réessaie.');
      setStep('level');
    }
  };

  const canContinue = interest.trim().length >= 2;
  const canGenerate = !!level;

  return (
    <div className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">

        {step === 'interest' && (
          <motion.div
            key="interest"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>
                Étape 1 sur 2
              </p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                Quel est ton centre d&apos;intérêt ?
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-body)' }}>
                On va générer un cours sur l&apos;IA en lien avec ce que tu aimes.
              </p>
            </div>

            <input
              type="text"
              value={interest}
              onChange={e => setInterest(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canContinue) setStep('level'); }}
              placeholder="Ex : football, manga, cuisine…"
              maxLength={50}
              className="w-full px-4 py-3 text-sm outline-none transition-colors duration-200"
              style={{
                background:   'var(--color-surface)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
                color:        'var(--color-ink)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              autoFocus
            />

            <div className="flex flex-wrap gap-2">
              {INTEREST_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInterest(s)}
                  className="px-3 py-1.5 text-sm transition-colors duration-150"
                  style={{
                    background:   interest === s ? 'var(--color-accent-soft)' : 'var(--color-bg)',
                    border:       `1px solid ${interest === s ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    color:        interest === s ? 'var(--color-accent)' : 'var(--color-body)',
                    borderRadius: '8px',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              disabled={!canContinue}
              onClick={() => setStep('level')}
              className="w-full py-3 font-semibold text-sm transition-colors duration-150"
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
              Continuer
            </button>
          </motion.div>
        )}

        {step === 'level' && (
          <motion.div
            key="level"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>
                Étape 2 sur 2
              </p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                Quel est ton niveau ?
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-body)' }}>
                Le cours sera adapté à ton niveau scolaire.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className="flex items-center gap-4 px-5 py-4 text-left transition-colors duration-150"
                  style={{
                    background:   level === l.value ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                    border:       `1px solid ${level === l.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>{l.label}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p
                className="text-sm px-4 py-3"
                style={{
                  color:        'var(--color-error)',
                  background:   'var(--color-error-soft)',
                  border:       '1px solid rgba(185,28,28,0.2)',
                  borderRadius: '8px',
                }}
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('interest'); setError(''); }}
                className="flex-1 py-3 text-sm font-medium transition-colors duration-200"
                style={{
                  background:   'var(--color-surface)',
                  border:       '1px solid var(--color-border)',
                  color:        'var(--color-body)',
                  borderRadius: '8px',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                Retour
              </button>
              <button
                disabled={!canGenerate}
                onClick={() => { void handleGenerate(); }}
                className="flex-1 py-3 font-semibold text-sm transition-colors duration-150"
                style={{
                  background:   canGenerate ? 'var(--color-accent)' : 'var(--color-bg)',
                  color:        canGenerate ? '#fff' : 'var(--color-muted)',
                  cursor:       canGenerate ? 'pointer' : 'not-allowed',
                  border:       `1px solid ${canGenerate ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                }}
                onMouseEnter={e => { if (canGenerate) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={e => { if (canGenerate) e.currentTarget.style.background = 'var(--color-accent)'; }}
              >
                Générer mon cours
              </button>
            </div>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 py-12 text-center"
          >
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{
                background:   'var(--color-accent-soft)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <span
                className="w-8 h-8 rounded-full border-2 border-current animate-spin block"
                style={{ borderColor: 'var(--color-border) var(--color-border) var(--color-border) var(--color-accent)' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)', fontSize: '1.1rem' }}>
                Génération en cours…
              </p>
              <p className="text-sm" style={{ color: 'var(--color-body)' }}>
                L&apos;IA prépare ton cours sur <strong style={{ color: 'var(--color-ink)' }}>{interest}</strong>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
