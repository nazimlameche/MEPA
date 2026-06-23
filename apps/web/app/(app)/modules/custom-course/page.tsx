import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { Parcours } from '@/lib/types/custom-course';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import ParcoursDashboard from '@/components/custom-course/ParcoursDashboard';
import NewParcoursFlow from '@/components/custom-course/NewParcoursFlow';
import AlKoCorner from '@/components/mascot/AlKoCorner';

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default async function CustomCoursePage() {
  const session = await auth();
  const token   = session?.accessToken;
  if (!token) redirect('/login');

  let parcourslist: Parcours[] = [];
  try {
    parcourslist = await apiClient.get<Parcours[]>('/custom-course/parcours', token);
  } catch {
    // API unavailable — show empty state
  }

  if (parcourslist.length === 0) {
    return (
      <PageContainer size="narrow">
        <PageHeader
          title="Cours Sur-Mesure"
          subtitle="Choisis un thème et découvre l'IA à travers ce qui te passionne."
        />
        <Section>
          <NewParcoursFlow />
        </Section>
      </PageContainer>
    );
  }

  const [current, ...previous] = parcourslist;

  return (
    <PageContainer size="default">
      <ParcoursDashboard parcours={current} />

      {previous.length > 0 && (
        <Section title="Parcours précédents">
          <div className="flex flex-col gap-3">
            {previous.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 p-4"
                style={{
                  background:   'var(--color-surface-card)',
                  border:       '1px solid var(--color-surface-border)',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {p.theme}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {timeAgo(p.createdAt)} · {p.chapters.filter(c => c.status === 'completed').length}/6 chapitres
                  </p>
                </div>
                <Link
                  href={`/modules/custom-course/${p.id}`}
                  className="px-4 py-1.5 text-xs font-medium transition-colors duration-200"
                  style={{
                    border:       '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                    color:        'var(--color-text-secondary)',
                  }}
                >
                  Reprendre
                </Link>
              </div>
            ))}
          </div>
        </Section>
      )}
      <AlKoCorner position="bottom-right" />
    </PageContainer>
  );
}
