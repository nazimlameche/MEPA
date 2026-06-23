'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null;

  const isHot = days >= 7;

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
      style={{
        background:  'rgba(239,68,68,0.12)',
        border:      '1px solid rgba(239,68,68,0.25)',
        color:       'var(--color-danger)',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        animate={isHot
          ? { scale: [1, 1.25, 1], rotate: [-8, 8, -8, 0] }
          : { scale: [1, 1.1, 1] }
        }
        transition={{ duration: isHot ? 0.8 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame className="h-3.5 w-3.5" />
      </motion.span>
      <motion.span
        key={days}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {days} jour{days > 1 ? 's' : ''} de suite
      </motion.span>
    </motion.div>
  );
}
