'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '4',    label: "modules d'apprentissage" },
  { value: '100%', label: 'gratuit et open source' },
  { value: 'CNIL', label: 'validé & conforme RGPD' },
] as const;

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center"
        style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-surface-border)',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <p
              className="mb-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                color: 'var(--color-primary-light)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
