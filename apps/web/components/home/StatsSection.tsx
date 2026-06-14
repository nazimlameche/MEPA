'use client';

import { motion } from 'framer-motion';
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

const stats = [
  { value: '4',    label: "modules d'apprentissage" },
  { value: '100%', label: 'gratuit et open source' },
  { value: 'CNIL', label: 'validé & conforme RGPD' },
] as const;

export default function StatsSection() {
  const { fadeUp, staggerContainer, transition } = useAnimationConfig();

  return (
    <section
      className="py-16 px-6"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <motion.div
        className="max-w-4xl mx-auto p-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center"
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            transition={transition}
          >
            <p
              className="mb-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize:   'clamp(2rem, 4vw, 2.6rem)',
                fontWeight: 600,
                color:      'var(--color-accent)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-body)' }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
