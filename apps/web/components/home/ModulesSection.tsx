'use client';

import { motion } from 'framer-motion';

const modules = [
  {
    icon: '📚',
    title: 'Parcours Théorique',
    description: 'Des leçons structurées avec quiz, textes à trous et histoires illustrées.',
    available: true,
  },
  {
    icon: '✏️',
    title: 'Atelier Prompting',
    description: "Apprends à rédiger des prompts efficaces et à éviter les pièges courants.",
    available: true,
  },
  {
    icon: '🎯',
    title: 'Cours Sur-Mesure',
    description: "Des cours générés par l'IA selon tes centres d'intérêt et ton niveau.",
    available: true,
  },
  {
    icon: '🧪',
    title: 'Bac à Sable',
    description: "Explore l'IA librement dans un espace sécurisé et modéré.",
    available: false,
  },
] as const;

export default function ModulesSection() {
  return (
    <section id="modules" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: 'var(--color-primary-light)' }}
          >
            Les modules
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Tout ce qu&apos;il faut pour maîtriser l&apos;IA
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-surface-border)',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(123,82,240,0.4)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-surface-border)')}
            >
              <span className="text-3xl">{mod.icon}</span>
              <div className="flex-1">
                <p
                  className="font-semibold mb-1.5"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', fontSize: '1rem' }}
                >
                  {mod.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {mod.description}
                </p>
              </div>
              <span
                className="self-start px-3 py-1 rounded-full text-xs font-medium"
                style={
                  mod.available
                    ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }
                }
              >
                {mod.available ? 'Disponible' : 'Bientôt'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
