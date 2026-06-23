'use client';

import { motion } from 'framer-motion';
import AlKo from './AlKo';

interface AlKoCornerProps {
  /** Coin d'affichage (défaut : bottom-right) */
  position?: 'bottom-right' | 'bottom-left';
  /** Délai avant apparition en ms (défaut : 800) */
  delay?: number;
}

/**
 * Al-Ko flottant dans un coin de la page.
 * À importer dans les pages modules — jamais sur une page qui a déjà un AlKo.
 */
export default function AlKoCorner({ position = 'bottom-right', delay = 800 }: AlKoCornerProps) {
  const isRight = position === 'bottom-right';

  return (
    <motion.div
      initial={{ opacity: 0, x: isRight ? 40 : -40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 200, damping: 24 }}
      style={{
        position: 'fixed',
        bottom:   20,
        ...(isRight ? { right: 20 } : { left: 20 }),
        zIndex:   50,
      }}
    >
      <AlKo
        variant="wave"
        size={90}
        hideName
        hideBubble
        armWave
      />
    </motion.div>
  );
}
