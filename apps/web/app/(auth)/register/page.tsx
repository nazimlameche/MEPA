'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'student', birthYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, birthYear: parseInt(form.birthYear, 10) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      setError(typeof data.message === 'string' ? data.message : 'Erreur lors de l\'inscription');
      return;
    }

    const data = (await res.json()) as { requiresParentalConsent: boolean };
    if (data.requiresParentalConsent) {
      router.push('/consent');
    } else {
      router.push('/login?registered=1');
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Inscription</h2>
        <p className="text-sm text-gray-500">Crée ton compte en quelques secondes.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-danger-50 border border-danger-500/20 p-3 text-sm text-danger-500">{error}</div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
        <input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium text-gray-700">Je suis…</label>
        <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition bg-white">
          <option value="student">Élève / Étudiant</option>
          <option value="teacher">Enseignant</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="birthYear" className="text-sm font-medium text-gray-700">Année de naissance</label>
        <input id="birthYear" type="number" required min={1900} max={new Date().getFullYear()} value={form.birthYear}
          onChange={(e) => update('birthYear', e.target.value)}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-primary-500 text-white font-semibold py-2.5 text-sm hover:bg-primary-600 transition disabled:opacity-60">
        {loading ? 'Inscription…' : 'Créer mon compte'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Déjà inscrit ?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
      </p>
    </form>
  );
}
