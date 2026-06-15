'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import RoleCards from '@/components/auth/RoleCards';
import { notify } from '@/lib/toast';
import type { SignupRole } from '@ai-edu/shared';

const CURRENT_YEAR = new Date().getFullYear();

export default function RegisterPage() {
  const [step, setStep]           = useState<1 | 2>(1);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<SignupRole | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading]     = useState(false);

  const validateStep1 = (): boolean => {
    if (!email || !email.includes('@')) { notify.error.register(); return false; }
    if (password.length < 8)           { notify.error.register(); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!role)                         { notify.error.register(); return false; }
    const year = parseInt(birthYear, 10);
    if (!birthYear || isNaN(year) || year < 1940 || year > CURRENT_YEAR) {
      notify.error.register();
      return false;
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, role, birthYear: parseInt(birthYear, 10) }),
      });

      if (!res.ok) {
        const data = await res.json() as { message?: string };
        const msg = data.message ?? '';
        if (res.status === 409 || msg.toLowerCase().includes('exist')) {
          notify.error.emailAlreadyExists();
        } else {
          notify.error.register();
        }
        console.error('[Register]', res.status, data);
        return;
      }

      notify.success.register();
      await signIn('credentials', { email, password, redirect: false });

      // CNIL : si âge < 15 ans → flow consentement parental
      if (CURRENT_YEAR - parseInt(birthYear, 10) < 15) {
        window.location.href = '/consent';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('[Register] network error', err);
      notify.error.network();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => signIn('google', { callbackUrl: '/dashboard' });

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
          Créer un compte
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          {step === 1 ? 'Étape 1 sur 2 — Tes identifiants' : 'Étape 2 sur 2 — Ton profil'}
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="flex gap-2 mb-6">
        {([1, 2] as const).map(s => (
          <div
            key={s}
            className="flex-1 h-1 transition-colors duration-300"
            style={{
              background:   s <= step ? 'var(--color-accent)' : 'var(--color-border)',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="p-8"
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        {step === 1 && (
          <>
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 font-medium text-sm transition-colors duration-200"
              style={{
                background:   'var(--color-bg)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
                color:        'var(--color-body)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <GoogleIcon />
              Continuer avec Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>ou</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-4" noValidate>
              <Field id="email"    label="Adresse email"  type="email"    value={email}    onChange={setEmail}    placeholder="ton@email.fr"        autoComplete="email" />
              <Field id="password" label="Mot de passe"   type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" autoComplete="new-password" />
              <SubmitButton label="Continuer" loading={false} />
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>Qui es-tu ?</p>
              <RoleCards value={role} onChange={setRole} />
            </div>

            <Field
              id="birthYear" label="Année de naissance" type="number"
              value={birthYear} onChange={setBirthYear}
              placeholder="Ex : 2008"
              autoComplete="bday-year"
              inputMode="numeric"
            />

            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Ton année de naissance nous permet de respecter la réglementation RGPD.
              Si tu as moins de 15 ans, un accord parental sera demandé.
            </p>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 text-sm font-medium transition-colors duration-200"
                style={{
                  background:   'var(--color-surface)',
                  border:       '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color:        'var(--color-body)',
                }}
              >
                Retour
              </button>
              <SubmitButton label="Créer mon compte" loading={loading} className="flex-1" />
            </div>
          </form>
        )}
      </div>

      {/* Lien connexion */}
      <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-muted)' }}>
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium transition-colors duration-200"
          style={{ color: 'var(--color-accent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function Field({
  id, label, type, value, onChange, placeholder, autoComplete, inputMode,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
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
  );
}

function SubmitButton({ label, loading, className = '' }: { label: string; loading: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`py-3 font-semibold text-sm transition-colors duration-200 ${className}`}
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
      {loading ? 'Chargement…' : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
