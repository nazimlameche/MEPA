'use client';

import { motion } from 'framer-motion';

type Tone = 'accent' | 'complete' | 'error' | 'primary' | 'success';

interface ProgressBarProps {
  value:      number;
  max?:       number;
  tone?:      Tone;
  height?:    number;
  className?: string;
  label?:     string;
}

const TONE_COLORS: Record<Tone, string> = {
  accent:   'var(--color-accent)',
  complete: 'var(--color-complete)',
  error:    'var(--color-error)',
  // backward-compat aliases
  primary:  'var(--color-accent)',
  success:  'var(--color-complete)',
};

export default function ProgressBar({
  value,
  max = 100,
  tone = 'accent',
  height = 6,
  className = '',
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className} role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
      <div
        className="w-full overflow-hidden"
        style={{ height, background: 'var(--color-border)', borderRadius: '2px' }}
      >
        <motion.div
          className="h-full"
          style={{ background: TONE_COLORS[tone], borderRadius: '2px' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
