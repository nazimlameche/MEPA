'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { ParcoursLevel, Parcours } from '@/lib/types/custom-course';

const LEVELS: { value: ParcoursLevel; label: string }[] = [
  { value: 'college', label: 'Collégien' },
  { value: 'lycee',   label: 'Lycéen'   },
  { value: 'adulte',  label: 'Adulte'   },
];

export default function ThemeForm() {
  const router           = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState<ParcoursLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = theme.trim().length >= 2 && level !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    const token = session?.accessToken;
    if (!token) { toast.error('Session expirée, reconnecte-toi.'); return; }

    setLoading(true);
    try {
      const parcours = await apiClient.post<Parcours>(
        '/custom-course/parcours',
        { theme: theme.trim(), level },
        token,
      );
      router.push(`/modules/custom-course/${parcours.id}`);
    } catch (err) {
      console.error('[ThemeForm] createParcours', err);
      toast.error('Erreur lors de la création du parcours. Réessaie.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6 max-w-md mx-auto">
      <div>
        <label
          htmlFor="theme-input"
          className="block mb-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Sur quoi tu veux apprendre l'IA ?
        </label>
        <input
          id="theme-input"
          type="text"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          maxLength={100}
          placeholder="Ex: le foot, la cuisine, l'espace…"
          className="w-full px-4 py-3 text-sm outline-none transition-colors duration-200"
          style={{
            background:   'var(--color-surface-card)',
            border:       '1px solid var(--color-surface-border)',
            borderRadius: '8px',
            color:        'var(--color-text-primary)',
          }}
          onFocus={e  => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onBlur={e   => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
        />
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {theme.length}/100
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Ton niveau
        </p>
        <div className="flex gap-2">
          {LEVELS.map(({ value, label }) => {
            const selected = level === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setLevel(value)}
                className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  background:   selected ? 'var(--color-primary)' : 'transparent',
                  color:        selected ? '#fff' : 'var(--color-text-secondary)',
                  border:       `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-surface-border)'}`,
                  borderRadius: '8px',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="w-full py-3 font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2"
        style={{
          background:   canSubmit && !loading ? 'var(--color-primary)' : 'var(--color-surface-card)',
          color:        canSubmit && !loading ? '#fff' : 'var(--color-text-muted)',
          border:       `1px solid ${canSubmit && !loading ? 'var(--color-primary)' : 'var(--color-surface-border)'}`,
          borderRadius: '8px',
          cursor:       canSubmit && !loading ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => { if (canSubmit && !loading) e.currentTarget.style.background = 'var(--color-primary-light)'; }}
        onMouseLeave={e => { if (canSubmit && !loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Création du parcours…
          </>
        ) : (
          'Créer mon parcours IA'
        )}
      </button>
    </form>
  );
}
