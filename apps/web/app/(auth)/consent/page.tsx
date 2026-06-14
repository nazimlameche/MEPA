'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ parentEmail }),
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
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-block text-2xl font-semibold mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
        >
          AI·Edu
        </Link>
        <h1 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
          Accord parental requis
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          Conformément au RGPD, un accord parental est nécessaire pour les moins de 15 ans.
        </p>
      </div>

      {/* Card */}
      <div
        className="p-8"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
      >
        {step === 'info' && (
          <div className="flex flex-col gap-5">
            <InfoBlock icon={ShieldCheck} title="Pourquoi cet accord ?" text="La loi française (Art. 8 RGPD) exige le consentement d'un parent ou tuteur légal pour tout mineur de moins de 15 ans utilisant des services numériques." />
            <InfoBlock icon={Mail} title="Comment ça marche ?" text="Tu vas fournir l'adresse email de ton parent ou tuteur. Il recevra un email pour valider ton inscription. Tu pourras accéder à la plateforme dès sa validation." />
            <InfoBlock icon={Lock} title="Tes données sont protégées" text="Aucune donnée personnelle n'est transmise à des tiers. L'email parental est uniquement utilisé pour la procédure de consentement." />
            <button
              onClick={() => setStep('form')}
              className="w-full py-3 font-semibold text-sm transition-colors duration-150 mt-2"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', border: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Continuer
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parentEmail" className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
                Email du parent ou tuteur légal
              </label>
              <input
                id="parentEmail"
                type="email"
                autoComplete="off"
                value={parentEmail}
                onChange={e => setParentEmail(e.target.value)}
                placeholder="parent@email.fr"
                className="w-full px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{
                  background:   'var(--color-surface)',
                  border:       '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color:        'var(--color-ink)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
                <div
                  className="w-5 h-5 flex items-center justify-center transition-colors duration-150"
                  style={{
                    background:   agreed ? 'var(--color-accent)' : 'var(--color-surface)',
                    border:       `1px solid ${agreed ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
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
              <span className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
                Je certifie être le parent ou tuteur légal de cet enfant et j&apos;accepte les{' '}
                <Link href="/privacy" style={{ color: 'var(--color-accent)' }}>conditions d&apos;utilisation</Link>{' '}
                et la{' '}
                <Link href="/privacy" style={{ color: 'var(--color-accent)' }}>politique de confidentialité</Link>.
              </span>
            </label>

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
                onClick={() => { setStep('info'); setError(''); }}
                className="flex-1 py-3 text-sm font-medium transition-colors duration-200"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-body)' }}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 font-semibold text-sm transition-colors duration-150"
                style={{
                  background:   loading ? 'var(--color-accent-soft)' : 'var(--color-accent)',
                  color:        loading ? 'var(--color-accent)' : '#fff',
                  cursor:       loading ? 'not-allowed' : 'pointer',
                  borderRadius: '8px',
                  border:       'none',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-accent)'; }}
              >
                {loading ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-5 text-center py-2">
            <div>
              <p className="font-semibold mb-2" style={{ color: 'var(--color-ink)', fontSize: '1.1rem' }}>
                Demande envoyée
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
                Un email a été envoyé à ton parent ou tuteur légal. Tu pourras accéder à tous les modules dès qu&apos;il aura validé ta demande.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-8 py-3 font-semibold text-sm transition-colors duration-150"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Accéder à la plateforme
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';

function InfoBlock({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <Icon size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>{text}</p>
      </div>
    </div>
  );
}
