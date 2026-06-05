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
        background: 'var(--color-surface-card)',
        borderRight: '1px solid var(--color-surface-border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="text-xl font-semibold px-3 mb-8 block"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-light)' }}
      >
        AI·Edu
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
              style={{
                background: active ? 'rgba(76,31,212,0.18)' : 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                if (!active) e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent';
                if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Icon
                size={18}
                style={{ color: active ? 'var(--color-primary-light)' : 'inherit', flexShrink: 0 }}
                aria-hidden="true"
              />
              {label}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-primary-light)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bas : profil + déconnexion */}
      <div className="flex flex-col gap-1 pt-4" style={{ borderTop: '1px solid var(--color-surface-border)' }}>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <User size={18} aria-hidden="true" />
          Mon profil
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 w-full text-left"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = 'var(--color-danger)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <LogOut size={18} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
