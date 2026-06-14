'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, PenLine, Sparkles, FlaskConical, User, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/modules/theory',        icon: BookOpen,        label: 'Parcours' },
  { href: '/modules/prompting',     icon: PenLine,         label: 'Prompting' },
  { href: '/modules/custom-course', icon: Sparkles,        label: 'Sur-Mesure' },
  { href: '/modules/sandbox',       icon: FlaskConical,    label: 'Bac à Sable' },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0 py-6 px-4"
      style={{
        background:  'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="text-xl font-semibold px-3 mb-8 block"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
      >
        AI·Edu
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150"
              style={{
                background:   active ? 'transparent' : 'transparent',
                color:        active ? 'var(--color-accent)' : 'var(--color-muted)',
                borderRadius: '8px',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--color-bg)';
                  e.currentTarget.style.color      = 'var(--color-body)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color      = 'var(--color-muted)';
                }
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5"
                  style={{ background: 'var(--color-accent)', borderRadius: '0 2px 2px 0' }}
                />
              )}
              <Icon
                size={17}
                style={{ color: active ? 'var(--color-accent)' : 'inherit', flexShrink: 0 }}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bas : profil + déconnexion */}
      <div className="flex flex-col gap-0.5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--color-muted)', borderRadius: '8px' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-bg)';
            e.currentTarget.style.color      = 'var(--color-body)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color      = 'var(--color-muted)';
          }}
        >
          <User size={17} aria-hidden="true" />
          Mon profil
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150 w-full text-left"
          style={{ color: 'var(--color-muted)', borderRadius: '8px' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-error-soft)';
            e.currentTarget.style.color      = 'var(--color-error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color      = 'var(--color-muted)';
          }}
        >
          <LogOut size={17} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
