import Link from 'next/link';
import { mockModules } from '@/lib/mock/dashboard-data';

export default function ModulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}
        >
          Tous les modules
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Choisis un module pour commencer ou continuer ta progression.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockModules.map(mod => (
          <div
            key={mod.id}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-surface-border)',
              opacity: mod.available ? 1 : 0.55,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{mod.icon}</span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={
                  mod.available
                    ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }
                }
              >
                {mod.available ? 'Disponible' : 'Bientôt'}
              </span>
            </div>
            <p
              className="font-semibold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {mod.title}
            </p>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {mod.description}
            </p>
            {mod.available && (
              <Link
                href={mod.route}
                className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
              >
                Accéder →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
