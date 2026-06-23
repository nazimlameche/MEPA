'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ModuleSummary } from '@/lib/types/dashboard';

export default function ModuleCard({ mod }: { mod: ModuleSummary }) {
  const inner = (
    <motion.div
      className="p-5 flex flex-col gap-4 h-full"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
        opacity:      mod.available ? 1 : 0.55,
        cursor:       mod.available ? 'pointer' : 'default',
      }}
      whileHover={mod.available ? {
        y:           -4,
        borderColor: 'var(--color-accent)',
        boxShadow:   '0 8px 32px rgba(76,31,212,0.18)',
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-start justify-between">
        <span
          className="px-2.5 py-1 text-xs font-medium"
          style={{
            borderRadius: '8px',
            ...(mod.available
              ? { background: 'var(--color-complete-soft)', color: 'var(--color-complete)' }
              : { background: 'var(--color-bg)',            color: 'var(--color-muted)', border: '1px solid var(--color-border)' }),
          }}
        >
          {mod.available ? 'Disponible' : 'Bientôt'}
        </span>
      </div>

      <div className="flex-1">
        <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>
          {mod.title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
          {mod.description}
        </p>
      </div>

      {mod.available && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>
            <span>Progression</span>
            <span>{mod.progress}%</span>
          </div>
          <div
            className="w-full h-1.5 overflow-hidden"
            style={{ background: 'var(--color-border)', borderRadius: '4px' }}
          >
            <motion.div
              className="h-full"
              style={{
                background:   mod.progress === 100 ? 'var(--color-complete)' : 'var(--color-accent)',
                borderRadius: '4px',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${mod.progress}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  if (!mod.available) return inner;
  return <Link href={mod.route} className="block h-full">{inner}</Link>;
}
