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
          background:   'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href="/dashboard"
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
        >
          AI·Edu
        </Link>
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          style={{ color: 'var(--color-muted)' }}
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
              style={{ background: 'rgba(28,25,23,0.25)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 flex flex-col py-4 px-3"
              style={{
                background:  'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <nav className="flex flex-col gap-0.5 flex-1">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium"
                      style={{
                        color:        active ? 'var(--color-accent)' : 'var(--color-muted)',
                        borderRadius: '8px',
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5"
                          style={{ background: 'var(--color-accent)', borderRadius: '0 2px 2px 0' }}
                        />
                      )}
                      <Icon size={17} aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex flex-col gap-0.5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium"
                  style={{ color: 'var(--color-muted)', borderRadius: '8px' }}
                >
                  <User size={17} aria-hidden="true" />
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full text-left"
                  style={{ color: 'var(--color-muted)', borderRadius: '8px' }}
                >
                  <LogOut size={17} aria-hidden="true" />
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
