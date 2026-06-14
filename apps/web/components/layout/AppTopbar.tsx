'use client';

import Link from 'next/link';
import { Flame, Zap } from 'lucide-react';

interface AppTopbarProps {
  streak: number;
  xp: number;
  level: number;
  userName?: string | undefined;
}

export default function AppTopbar({ streak, xp, level, userName }: AppTopbarProps) {
  return (
    <div
      className="hidden md:flex items-center justify-end gap-5 h-14 px-8 sticky top-0 z-30"
      style={{
        background:   'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {streak > 0 && (
        <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-streak)' }}>
          <Flame size={14} aria-hidden="true" />
          <span className="font-semibold">{streak}</span>
          <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>jours</span>
        </span>
      )}

      <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-complete)' }}>
        <Zap size={14} aria-hidden="true" />
        <span className="font-semibold">{xp} XP</span>
      </span>

      <Link
        href="/profile"
        className="flex items-center gap-2 transition-colors duration-200"
        style={{ color: 'var(--color-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
      >
        <span
          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--color-accent)', borderRadius: '50%' }}
        >
          {level}
        </span>
        <span className="text-sm font-medium">{userName ?? 'Profil'}</span>
      </Link>
    </div>
  );
}
