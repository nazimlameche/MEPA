'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap, RotateCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { PromptExercise, PromptScoreOutput } from '@/lib/types/prompting';
import ScoreDisplay from './ScoreDisplay';
import AikoChat from '@/components/aiko/AikoChat';

/** Construit le contexte AIKO à partir du résultat de scoring.
 *  Jamais de PII — uniquement le sujet, le prompt et les feedbacks Mistral. */
function buildAikoContext(subject: string, userPrompt: string, result: PromptScoreOutput): string {
  const pii = result['sécurité_données'].pii_found;
  const lines = [
    `Sujet de l'exercice : ${subject}`,
    `Prompt soumis par l'utilisateur : ${userPrompt}`,
    `Score total : ${result.total_score}/100`,
    '',
    `=== Feedback global ===`,
    result.global_feedback,
    '',
    `=== Clarté de l'objectif (${result['clarté_objectif'].score}/100) ===`,
    result['clarté_objectif'].feedback,
    '',
    `=== Contexte fourni (${result.contexte.score}/100) ===`,
    result.contexte.feedback,
    '',
    `=== Format de sortie (${result.format_sortie.score}/100) ===`,
    result.format_sortie.feedback,
    '',
    `=== Sécurité & données (${result['sécurité_données'].score}/100) ===`,
    result['sécurité_données'].feedback,
    pii.length > 0 ? `Informations personnelles détectées : ${pii.join(', ')}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

const XP_PERFECT = 25;
const XP_PARTIAL = 10;

interface Props {
  exercise: PromptExercise;
}

type PageState = 'writing' | 'loading' | 'result' | 'perfect';

export default function PromptingExercise({ exercise }: Props) {
  const { data: session }         = useSession();
  const [state, setState]         = useState<PageState>('writing');
  const [userPrompt, setPrompt]   = useState('');
  const [result, setResult]       = useState<PromptScoreOutput | null>(null);
  const [attempts, setAttempts]   = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [error, setError]         = useState('');

  const showAiko   = (state === 'result' || state === 'perfect') && result !== null;
  const aikoContext = useMemo(
    () => (result ? buildAikoContext(exercise.subject, userPrompt, result) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result],
  );

  // Restore prior attempts count and best score on mount
  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    fetch(`${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/prompting/attempts/${exercise.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: { count?: number; bestScore?: number | null } | null) => {
        if (data) {
          if (typeof data.count === 'number' && data.count > 0) setAttempts(data.count);
          if (typeof data.bestScore === 'number') setBestScore(data.bestScore);
        }
      })
      .catch(() => { /* best-effort */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const MIN_LENGTH = 20;
  const canSubmit  = userPrompt.trim().length >= MIN_LENGTH && state === 'writing';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setState('loading');

    try {
      const token = session?.accessToken;
      const res = await fetch('/api/prompting/score', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ exerciseId: exercise.id, subject: exercise.subject, userPrompt: userPrompt.trim() }),
      });

      const data = await res.json() as PromptScoreOutput & { message?: string };

      if (!res.ok) {
        setError(data.message ?? 'Une erreur est survenue.');
        setState('writing');
        return;
      }

      setResult(data);
      setAttempts(a => a + 1);
      setState(data.passed ? 'perfect' : 'result');
    } catch {
      setError('Impossible de contacter le serveur. Réessaie.');
      setState('writing');
    }
  };

  const handleRetry = () => {
    setState('writing');
    setError('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/modules/prompting"
          className="flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-body)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Atelier Prompting
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {bestScore !== null && (
            <span
              className="text-xs px-2.5 py-1"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
            >
              Meilleur : {bestScore}/100
            </span>
          )}
          {attempts > 0 && (
            <span
              className="text-xs px-2.5 py-1"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
            >
              Tentative {attempts + 1}
            </span>
          )}
        </div>
      </div>

      {/* Titre */}
      <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 600 }}>
        {exercise.title}
      </h1>

      {/* Sujet */}
      <div
        className="p-5"
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderLeft:   '2px solid var(--color-accent)',
          borderRadius: '8px',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
          Ton sujet
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {exercise.subject}
        </p>
      </div>

      {/* Conseil pédagogique */}
      <div
        className="px-4 py-3 flex gap-3"
        style={{
          background:   'var(--color-bg)',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
          {exercise.context}
        </p>
      </div>

      {/* Zone de saisie */}
      <AnimatePresence mode="wait">
        {(state === 'writing' || state === 'loading') && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            <label htmlFor="user-prompt" className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
              Écris ton prompt ici
            </label>
            <textarea
              id="user-prompt"
              value={userPrompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={state === 'loading'}
              placeholder="Rédige un prompt clair et précis pour demander à une IA de t'aider..."
              rows={6}
              className="w-full px-4 py-3 text-sm outline-none resize-none transition-colors duration-200"
              style={{
                background:   'var(--color-surface)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
                color:        'var(--color-ink)',
                lineHeight:   1.7,
                fontFamily:   'var(--font-mono)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: userPrompt.trim().length < MIN_LENGTH ? 'var(--color-muted)' : 'var(--color-complete)' }}
              >
                {userPrompt.trim().length} caractères
                {userPrompt.trim().length < MIN_LENGTH && ` (minimum ${MIN_LENGTH})`}
              </span>
              {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
            </div>

            <button
              onClick={() => { void handleSubmit(); }}
              disabled={!canSubmit}
              className="w-full py-3 font-semibold text-sm transition-colors duration-150"
              style={{
                background:   canSubmit ? 'var(--color-accent)' : 'var(--color-bg)',
                color:        canSubmit ? '#fff' : 'var(--color-muted)',
                cursor:       canSubmit ? 'pointer' : 'not-allowed',
                border:       `1px solid ${canSubmit ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '8px',
              }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = 'var(--color-accent)'; }}
            >
              {state === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                  Évaluation en cours…
                </span>
              ) : (
                'Soumettre mon prompt'
              )}
            </button>
          </motion.div>
        )}

        {state === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
            <ScoreDisplay result={result} />
            <div className="flex items-center gap-1 px-1" style={{ color: 'var(--color-complete)' }}>
              <Zap size={14} aria-hidden="true" />
              <span className="text-sm font-semibold">+{XP_PARTIAL} XP</span>
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-3 font-semibold text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', border: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Améliorer mon prompt
            </button>
          </motion.div>
        )}

        {state === 'perfect' && result && (
          <motion.div key="perfect" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
            <ScoreDisplay result={result} />
            <div
              className="p-5 flex items-center gap-4"
              style={{
                background:   'var(--color-complete-soft)',
                border:       '1px solid rgba(77,124,15,0.25)',
                borderRadius: '8px',
              }}
            >
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-complete)' }}>Score parfait.</p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap size={14} style={{ color: 'var(--color-complete)' }} aria-hidden="true" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-complete)' }}>+{XP_PERFECT} XP</span>
                  {attempts > 1 && (
                    <span className="text-xs ml-2" style={{ color: 'var(--color-muted)' }}>en {attempts} tentative{attempts > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/modules/prompting"
              className="w-full py-3 font-semibold text-sm text-center transition-colors duration-150 block"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Exercice suivant
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AIKO — explication de la note, visible uniquement après scoring */}
      {showAiko && (
        <AikoChat
          context={aikoContext}
          chapterTitle={`Score ${result!.total_score}/100 — ${exercise.title}`}
          inputPlaceholder="Demande-moi d'expliquer ta note…"
          emptyStateMessage="Je connais ton score et les feedbacks détaillés. Demande-moi d'expliquer un critère, ce que tu aurais pu faire mieux, ou comment reformuler ton prompt !"
        />
      )}
    </div>
  );
}
