'use client';

import { motion } from 'framer-motion';
import AlKo from '@/components/mascot/AlKo';

export default function SandboxComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <AlKo
          variant="sad"
          size={160}
          hideName
          bubble="Le bac à sable est fermé mais reviens bientôt !"
          bubbleOffsetX={-100}
          bubbleOffsetY={40}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-2"
      >
        <h1
          style={{
            fontSize:   '1.5rem',
            fontWeight: 600,
            color:      'var(--color-text-primary)',
          }}
        >
          Bac à Sable — Bientôt disponible
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '38ch', fontSize: '0.95rem' }}>
          Al-Ko prépare l&apos;arène. La fonctionnalité de chat libre avec l&apos;IA arrive très bientôt !
        </p>
      </motion.div>
    </div>
  );
}
