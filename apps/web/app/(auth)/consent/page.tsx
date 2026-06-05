'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type ConsentStep = 'info' | 'form' | 'done';

export default function ConsentPage() {
  const [step, setStep]               = useState<ConsentStep>('info');
  const [parentEmail, setParentEmail] = useState('');
  const [agreed, setAgreed]           = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!parentEmail || !parentEmail.includes('@')) {
      setError('Adresse email du parent invalide.');
      return;
    }
    if (!agreed) {
      setError('Le parent doit accepter les conditions.');
      return;
    }

    setLoading(true);
    try {
      // CNIL : envoi de l'email parental à l'API pour validation et enregistrement
      const res = await fetch('/api/auth/parental-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail }),
      });

      if (!res.ok) {
        const data = await res.json() as { message?: string };
        setError(data.message ?? 'Une erreur est survenue.');
        return;
      }

      setStep('done');
    } catch {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-block text-xl font-semibold mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-light)' }}
        >
          AI·Edu
        </Link>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: 'rgba(76,31,212,0.15)', border: '1px solid rgba(76,31,212,0.3)' }}
        >
          🔒
        </div>
        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Accord parental requis
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Conformément au RGPD, un accord parental est nécessaire pour les moins de 15 ans.
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-surface-border)',
        }}
      >
        {step === 'info' && (
          <div className="flex flex-col gap-5">
            <InfoBlock
              emoji="📋"
              title="Pourquoi cet accord ?"
              text="La loi française (Art. 8 RGPD) exige le consentement d'un parent ou tuteur légal pour tout mineur de moins de 15 ans utilisant des services numériques."
            />
            <InfoBlock
              emoji="📧"
              title="Comment ça marche ?"
              text="Tu vas fournir l'adresse email de ton parent ou tuteur. Il recevra un email pour valider ton inscription. Tu pourras accéder à la plateforme dès sa validation."
            />
            <InfoBlock
              emoji="🔒"
              title="Tes données sont protégées"
              text="Aucune donnée personnelle n'est transmise à des tiers. L'email parental est uniquement utilisé pour la procédure de consentement."
            />
            <button
              onClick={() => setStep('form')}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-200 mt-2"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              Continuer →
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="parentEmail"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Email du parent ou tuteur légal
              </label>
              <input
                id="parentEmail"
                type="email"
                autoComplete="off"
                value={parentEmail}
                onChange={e => setParentEmail(e.target.value)}
                placeholder="parent@email.fr"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-surface-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary-light)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
              />
            </div>

            {/* Checkbox consentement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors duration-150"
                  style={{
                    background: agreed ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${agreed ? 'var(--color-primary)' : 'var(--color-surface-border)'}`,
                  }}
                  onClick={() => setAgreed(v => !v)}
                >
                  {agreed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Je certifie être le parent ou tuteur légal de cet enfant et j&apos;accepte les{' '}
                <Link href="/privacy" style={{ color: 'var(--color-primary-light)' }}>
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" style={{ color: 'var(--color-primary-light)' }}>
                  politique de confidentialité
                </Link>.
              </span>
            </label>

            {error && (
              <p
                className="text-sm px-4 py-3 rounded-xl"
                style={{
                  color: 'var(--color-danger)',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('info'); setError(''); }}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-surface-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
                style={{
                  background: loading ? 'rgba(76,31,212,0.5)' : 'var(--color-primary)',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary-light)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
              >
                {loading ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-5 text-center py-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              ✅
            </div>
            <div>
              <p
                className="font-semibold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}
              >
                Demande envoyée !
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Un email a été envoyé à ton parent ou tuteur légal. Tu pourras accéder à tous les modules dès qu&apos;il aura validé ta demande.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              Accéder à la plateforme →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InfoBlock({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: 'rgba(76,31,212,0.1)', border: '1px solid rgba(76,31,212,0.2)' }}
      >
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {text}
        </p>
      </div>
    </div>
  );
}
