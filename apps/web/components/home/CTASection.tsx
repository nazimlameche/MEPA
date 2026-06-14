'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

export default function CTASection() {
  const { fadeUp, transition } = useAnimationConfig();

  return (
    <section
      className="py-24 px-6"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={transition}
        className="max-w-xl mx-auto text-center"
      >
        <h2
          className="mb-4"
          style={{
            fontSize:   'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 600,
          }}
        >
          Prêt à comprendre l&apos;IA ?
        </h2>
        <p className="mb-8 text-base" style={{ color: 'var(--color-body)', lineHeight: 1.75 }}>
          Rejoins des élèves et enseignants qui apprennent à utiliser l&apos;IA
          de manière éclairée et responsable.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-3 font-semibold text-base transition-colors duration-150"
          style={{
            background:   'var(--color-accent)',
            color:        '#fff',
            borderRadius: '8px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          Créer mon compte gratuitement
        </Link>
      </motion.div>
    </section>
  );
}
