'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RoleCards from '@/components/auth/RoleCards';
import { notify } from '@/lib/toast';
import type { SignupRole } from '@ai-edu/shared';

const CURRENT_YEAR = new Date().getFullYear();
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export default function RegisterRolePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [role, setRole]           = useState<SignupRole | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      notify.error.register();
      return;
    }
    const year = parseInt(birthYear, 10);
    if (!birthYear || isNaN(year) || year < 1940 || year > CURRENT_YEAR) {
      notify.error.register();
      return;
    }

    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!token) {
      notify.error.generic();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/me/role`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role, birthYear: year }),
      });

      if (!res.ok) {
        console.error('[RegisterRole] PATCH /users/me/role', res.status, await res.text());
        notify.error.generic();
        return;
      }

      notify.success.profileUpdated();

      // Update the JWT so needsRoleSelection is cleared before navigating
      await update({ needsRoleSelection: false, role });

      // Force server components to re-read the updated JWT cookie
      router.refresh();

      // CNIL: redirect to parental consent if minor
      if (CURRENT_YEAR - year < 15) {
        router.push('/consent');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[RegisterRole] network error', err);
      notify.error.network();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-block text-2xl font-semibold mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
        >
          AI·Edu
        </Link>
        <h1 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
          Finalise ton profil
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          Quelques infos pour personnaliser ton expérience.
        </p>
      </div>

      <div
        className="p-8"
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>Qui es-tu ?</p>
            <RoleCards value={role} onChange={setRole} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthYear" className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
              Année de naissance
            </label>
            <input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              placeholder="Ex : 2000"
              autoComplete="bday-year"
              inputMode="numeric"
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
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Requis par le RGPD — si tu as moins de 15 ans, un accord parental sera demandé.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-sm transition-colors duration-200"
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
            {loading ? 'Enregistrement…' : 'Accéder à la plateforme'}
          </button>
        </form>
      </div>
    </div>
  );
}
