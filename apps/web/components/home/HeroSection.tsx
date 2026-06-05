'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = (delay: number) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Fond — dégradé radial + orbes colorées CSS */}
      <div className="absolute inset-0" style={{ background: 'var(--color-surface)' }}>
        {/* Orbe violette centrale */}
        <div
          className="absolute"
          style={{
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(76,31,212,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        {/* Orbe verte bas-gauche */}
        <div
          className="absolute"
          style={{
            bottom: '5%',
            left: '15%',
            width: '400px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.18) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        {/* Orbe violette claire haut-droite */}
        <div
          className="absolute"
          style={{
            top: '5%',
            right: '10%',
            width: '350px',
            height: '250px',
            background: 'radial-gradient(ellipse at center, rgba(123,82,240,0.2) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Transition vers le bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface))' }}
      />

      {/* Contenu */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              border: '1px solid rgba(76,31,212,0.5)',
              color: 'var(--color-primary-light)',
              background: 'rgba(76,31,212,0.1)',
            }}
          >
            Projet CNIL · 100% gratuit
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.2)}
          className="mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
          }}
        >
          Apprends à utiliser l&apos;IA.{' '}
          <span style={{ color: 'var(--color-primary-light)' }}>
            Sans te faire avoir.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.35)}
          className="mb-10 mx-auto"
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            maxWidth: '500px',
          }}
        >
          Des cours gamifiés pour comprendre l&apos;intelligence artificielle,
          ses risques, et comment l&apos;utiliser intelligemment.
        </motion.p>

        <motion.div
          {...fadeUp(0.5)}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Commencer gratuitement →
          </Link>
          <a
            href="#modules"
            className="px-8 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200"
            style={{
              border: '1px solid var(--color-surface-border)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            Voir les modules ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
}
