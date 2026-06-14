'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

export default function HeroSection() {
  const { fadeUp, staggerContainer, transition } = useAnimationConfig();

  return (
    <section
      className="py-32 px-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        className="max-w-3xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} transition={transition} className="mb-6">
          <span
            className="inline-block px-3 py-1 text-xs font-medium"
            style={{
              border:       '1px solid var(--color-border)',
              color:        'var(--color-muted)',
              borderRadius: '8px',
            }}
          >
            Projet CNIL · 100% gratuit
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          transition={transition}
          className="mb-6"
          style={{
            fontSize:      'clamp(2.4rem, 6vw, 4rem)',
            fontWeight:    600,
            lineHeight:    1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Apprends à utiliser l&apos;IA.{' '}
          <span style={{ color: 'var(--color-accent)' }}>
            Sans te faire avoir.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={transition}
          className="mb-10 mx-auto"
          style={{
            fontSize:   '1.1rem',
            lineHeight: 1.75,
            color:      'var(--color-body)',
            maxWidth:   '52ch',
          }}
        >
          Des cours structurés pour comprendre l&apos;intelligence artificielle,
          ses risques, et comment l&apos;utiliser de manière éclairée.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={transition}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-8 py-3 font-semibold text-base transition-colors duration-150"
            style={{
              background:   'var(--color-accent)',
              color:        '#fff',
              borderRadius: '8px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Commencer gratuitement
          </Link>
          <a
            href="#modules"
            className="px-8 py-3 font-semibold text-base transition-colors duration-200"
            style={{
              border:       '1px solid var(--color-border)',
              color:        'var(--color-body)',
              borderRadius: '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border-strong)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-ink)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-body)';
            }}
          >
            Voir les modules
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
