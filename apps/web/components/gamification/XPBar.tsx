'use client';

import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

export default function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const progress = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-primary-600">Niveau {level}</span>
        <span className="text-gray-400">{currentXP} / {maxXP} XP</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
