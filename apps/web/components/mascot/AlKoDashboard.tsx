'use client';

import { motion } from 'framer-motion';
import AlKo from './AlKo';

/**
 * Al-Ko flottant en bas à droite du dashboard.
 * Client wrapper — le dashboard page.tsx est un Server Component.
 */
export default function AlKoDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        position:   'fixed',
        bottom:     24,
        right:      24,
        zIndex:     50,
        cursor:     'default',
      }}
    >
      <AlKo variant="wave" size={100} />
    </motion.div>
  );
}
