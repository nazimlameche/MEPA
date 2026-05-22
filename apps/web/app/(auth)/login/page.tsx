'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
        <p className="text-sm text-gray-500">Bienvenue ! Entrez vos identifiants.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-danger-50 border border-danger-500/20 p-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary-500 text-white font-semibold py-2.5 text-sm hover:bg-primary-600 transition disabled:opacity-60"
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-primary-600 font-medium hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </form>
  );
}
