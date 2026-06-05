'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Tous les champs sont requis.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => signIn('google', { callbackUrl: '/dashboard' });

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
        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Bon retour !
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Connecte-toi pour continuer ta progression.
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
        {/* Bouton Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-6 font-medium text-sm transition-colors duration-200"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-surface-border)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <GoogleIcon />
          Continuer avec Google
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'var(--color-surface-border)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ou</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-surface-border)' }} />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.fr"
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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-200 mt-1"
            style={{
              background: loading ? 'rgba(76,31,212,0.5)' : 'var(--color-primary)',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>

      {/* Lien inscription */}
      <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium transition-colors duration-200"
          style={{ color: 'var(--color-primary-light)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-primary-light)')}
        >
          Créer un compte
        </Link>
      </p>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
