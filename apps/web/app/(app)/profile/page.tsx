'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';

export default function ProfilePage() {
  const { data: session }       = useSession();
  const [confirm, setConfirm]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }

    setDeleting(true);
    try {
      const token  = session?.accessToken;
      const userId = session?.user?.id;
      if (!token || !userId) throw new Error('Session invalide');

      const res = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/users/${userId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('Erreur suppression');

      await signOut({ callbackUrl: '/' });
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader title="Mon profil" />

      <Section title="Informations">
        <div
          className="p-6 space-y-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
        >
          <InfoRow label="Email" value={session?.user?.email ?? '—'} />
          <InfoRow label="Nom"   value={session?.user?.name  ?? '—'} />
        </div>
      </Section>

      <Section title="Mes données — Droits RGPD">
        <div
          className="p-6 space-y-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
            Conformément au RGPD, tu as le droit d&apos;accéder à tes données, de les corriger et de les supprimer.
            La CNIL supervise l&apos;application de ces droits en France.
          </p>
          <a
            href={`${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/users/me/data`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 text-sm font-medium transition-colors duration-200"
            style={{
              background:   'var(--color-bg)',
              border:       '1px solid var(--color-border)',
              borderRadius: '8px',
              color:        'var(--color-body)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            Télécharger mes données
          </a>
        </div>
      </Section>

      <Section title="Zone dangereuse">
        <div
          className="p-6 space-y-4"
          style={{ background: 'var(--color-error-soft)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '8px' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
            La suppression de ton compte est définitive. Toutes tes données seront effacées
            (progression, tentatives, cours générés).
          </p>

          {confirm && (
            <p
              className="text-sm px-4 py-3"
              style={{
                color:        'var(--color-error)',
                background:   'var(--color-surface)',
                border:       '1px solid rgba(185,28,28,0.3)',
                borderRadius: '8px',
              }}
            >
              Cette action est irréversible. Clique à nouveau pour confirmer.
            </p>
          )}

          <button
            onClick={() => { void handleDelete(); }}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
            style={{
              background:   'rgba(185,28,28,0.08)',
              border:       '1px solid rgba(185,28,28,0.3)',
              borderRadius: '8px',
              color:        'var(--color-error)',
              cursor:       deleting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = 'rgba(185,28,28,0.15)'; }}
            onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = 'rgba(185,28,28,0.08)'; }}
          >
            <Trash2 size={15} aria-hidden="true" />
            {deleting ? 'Suppression…' : confirm ? 'Confirmer la suppression' : 'Supprimer mon compte'}
          </button>
        </div>
      </Section>
    </PageContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{value}</span>
    </div>
  );
}
