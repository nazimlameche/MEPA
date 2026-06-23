'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface XPBarProps {
  currentXP: number;
  maxXP:     number;
  level:     number;
}

export default function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const progress    = Math.min((currentXP / maxXP) * 100, 100);
  const motionWidth = useMotionValue(0);
  const springWidth = useSpring(motionWidth, { stiffness: 80, damping: 18 });
  const glowOpacity = useTransform(springWidth, [0, 100], [0.3, 0.9]);
  const barScaleX   = useTransform(springWidth, v => v / 100);

  useEffect(() => {
    const timer = setTimeout(() => motionWidth.set(progress), 120);
    return () => clearTimeout(timer);
  }, [progress, motionWidth]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <motion.span
          className="font-semibold"
          style={{ color: 'var(--color-primary)' }}
          key={level}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          Niveau {level}
        </motion.span>
        <motion.span
          style={{ color: 'var(--color-text-secondary)' }}
          key={currentXP}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {currentXP} / {maxXP} XP
        </motion.span>
      </div>

      {/* Track */}
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-sm"
          style={{
            background:      'var(--color-primary)',
            opacity:         glowOpacity,
            scaleX:          barScaleX,
            transformOrigin: 'left',
          }}
        />

        {/* Barre principale */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
          style={{
            width:      useTransform(springWidth, v => `${v}%`),
            background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))',
          }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </div>
  );
}
