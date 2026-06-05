'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, BookOpen, PenLine, Sparkles, FlaskConical, User, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/modules/theory',        icon: BookOpen,        label: 'Parcours' },
  { href: '/modules/prompting',     icon: PenLine,         label: 'Prompting' },
  { href: '/modules/custom-course', icon: Sparkles,        label: 'Sur-Mesure' },
  { href: '/modules/sandbox',       icon: FlaskConical,    label: 'Bac à Sable' },
] as const;

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();

  return (
    <>
      <header
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(22,19,43,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-surface-border)',
        }}
      >
        <Link
          href="/dashboard"
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-light)' }}
        >
          AI·Edu
        </Link>
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Drawer mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 flex flex-col py-4 px-3"
              style={{
                background: 'var(--color-surface-card)',
                borderRight: '1px solid var(--color-surface-border)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <nav className="flex flex-col gap-1 flex-1">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                      style={{
                        background: active ? 'rgba(76,31,212,0.18)' : 'transparent',
                        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-1 pt-4" style={{ borderTop: '1px solid var(--color-surface-border)' }}>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <User size={18} aria-hidden="true" />
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <LogOut size={18} aria-hidden="true" />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
