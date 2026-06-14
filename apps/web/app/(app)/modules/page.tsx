import Link from 'next/link';
import { mockModules } from '@/lib/mock/dashboard-data';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';

export default function ModulesPage() {
  return (
    <PageContainer size="default">
      <PageHeader
        title="Tous les modules"
        subtitle="Choisis un module pour commencer ou continuer ta progression."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockModules.map(mod => (
          <div
            key={mod.id}
            className="p-6"
            style={{
              background:   'var(--color-surface)',
              border:       '1px solid var(--color-border)',
              borderRadius: '8px',
              opacity:      mod.available ? 1 : 0.55,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className="px-2.5 py-1 text-xs font-medium"
                style={
                  mod.available
                    ? { background: 'var(--color-complete-soft)', color: 'var(--color-complete)', borderRadius: '6px' }
                    : { background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '6px' }
                }
              >
                {mod.available ? 'Disponible' : 'Bientôt'}
              </span>
            </div>
            <p
              className="font-semibold mb-1"
              style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}
            >
              {mod.title}
            </p>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-body)' }}>
              {mod.description}
            </p>
            {mod.available && (
              <Link
                href={mod.route}
                className="inline-block px-4 py-2 text-sm font-medium transition-colors duration-200"
                style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
              >
                Accéder
              </Link>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
