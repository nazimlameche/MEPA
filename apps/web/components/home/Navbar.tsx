'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background:   'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
        >
          AI·Edu
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold transition-colors duration-150"
            style={{
              background:   'var(--color-accent)',
              color:        '#fff',
              borderRadius: '8px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Commencer
          </Link>
        </div>
      </div>
    </nav>
  );
}
