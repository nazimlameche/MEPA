'use client';

import { motion } from 'framer-motion';

interface XPBarProps {
  xp: number;
  xpToNextLevel: number;
  level: number;
}

export default function XPBar({ xp, xpToNextLevel, level }: XPBarProps) {
  const pct = Math.min(100, Math.round((xp / xpToNextLevel) * 100));

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(76,31,212,0.2)', color: 'var(--color-primary-light)' }}
          >
            {level}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Niveau {level}
          </span>
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {xp} / {xpToNextLevel} XP
        </span>
      </div>

      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--color-primary-light)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        {xpToNextLevel - xp} XP avant le niveau {level + 1}
      </p>
    </div>
  );
}
