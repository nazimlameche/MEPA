'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(13, 11, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-surface-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-light)' }}
        >
          AI·Edu
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
