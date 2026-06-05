'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto text-center"
      >
        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Prêt à comprendre l&apos;IA ?
        </h2>
        <p className="mb-8 text-base" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          Rejoins des élèves et enseignants qui apprennent à utiliser l&apos;IA
          de manière éclairée et responsable.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Créer mon compte gratuitement
        </Link>
      </motion.div>
    </section>
  );
}
