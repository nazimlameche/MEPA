'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ModuleSummary } from '@/lib/types/dashboard';

export default function ModuleCard({ mod }: { mod: ModuleSummary }) {
  const inner = (
    <motion.div
      whileHover={mod.available ? { y: -3 } : {}}
      className="rounded-2xl p-5 flex flex-col gap-4 h-full"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
        opacity: mod.available ? 1 : 0.55,
        cursor: mod.available ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={e => {
        if (mod.available)
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(123,82,240,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-surface-border)';
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{mod.icon}</span>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={
            mod.available
              ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
              : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }
          }
        >
          {mod.available ? 'Disponible' : 'Bientôt'}
        </span>
      </div>

      <div className="flex-1">
        <p
          className="font-semibold mb-1"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {mod.title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {mod.description}
        </p>
      </div>

      {mod.available && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <span>Progression</span>
            <span>{mod.progress}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${mod.progress}%`,
                background: mod.progress === 100
                  ? 'var(--color-xp)'
                  : 'var(--color-primary-light)',
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  if (!mod.available) return inner;
  return <Link href={mod.route} className="block h-full">{inner}</Link>;
}
