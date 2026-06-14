'use client';

import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

const modules = [
  {
    title: 'Parcours théorique',
    description: 'Des leçons structurées avec quiz, textes à trous et histoires illustrées.',
    available: true,
  },
  {
    title: 'Atelier prompting',
    description: "Apprends à rédiger des prompts efficaces et à éviter les pièges courants.",
    available: true,
  },
  {
    title: 'Cours sur-mesure',
    description: "Des cours générés selon tes centres d'intérêt et ton niveau.",
    available: true,
  },
  {
    title: 'Bac à sable',
    description: "Explore l'IA librement dans un espace sécurisé et modéré.",
    available: false,
  },
] as const;

export default function ModulesSection() {
  const { fadeUp, staggerContainer, transition } = useAnimationConfig();

  return (
    <section
      id="modules"
      className="py-24 px-6"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="mb-12">
          <p
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Les modules
          </p>
          <h2
            style={{
              fontSize:   'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 600,
            }}
          >
            Tout ce qu&apos;il faut pour maîtriser l&apos;IA
          </h2>
        </RevealOnScroll>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={fadeUp}
              transition={transition}
              className="p-6 flex flex-col gap-4"
              style={{
                background:   'var(--color-surface)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
                transition:   'border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
              }}
            >
              <div className="flex-1">
                <p
                  className="font-semibold mb-2"
                  style={{ color: 'var(--color-ink)', fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}
                >
                  {mod.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
                  {mod.description}
                </p>
              </div>
              <span
                className="self-start px-2.5 py-1 text-xs font-medium"
                style={{
                  borderRadius: '8px',
                  ...(mod.available
                    ? { background: 'var(--color-complete-soft)', color: 'var(--color-complete)' }
                    : { background: 'var(--color-bg)',            color: 'var(--color-muted)', border: '1px solid var(--color-border)' }),
                }}
              >
                {mod.available ? 'Disponible' : 'Bientôt'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
