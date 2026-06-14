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
      className="p-5"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--color-accent)', borderRadius: '6px' }}
          >
            {level}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>
            Niveau {level}
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {xp} / {xpToNextLevel} XP
        </span>
      </div>

      <div
        className="w-full h-1.5 overflow-hidden"
        style={{ background: 'var(--color-border)', borderRadius: '2px' }}
      >
        <motion.div
          className="h-full"
          style={{ background: 'var(--color-accent)', borderRadius: '2px' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
        {xpToNextLevel - xp} XP avant le niveau {level + 1}
      </p>
    </div>
  );
}
