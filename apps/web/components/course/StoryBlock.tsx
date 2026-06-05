'use client';

import { useState } from 'react';
import type { StoryBlock } from '@/lib/types/course';

export default function StoryBlockComponent({ block }: { block: StoryBlock }) {
  const [showMoral, setShowMoral] = useState(false);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(76,31,212,0.08)',
        border: '1px solid rgba(76,31,212,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📖</span>
        <p
          className="font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {block.title}
        </p>
      </div>

      <p
        className="leading-relaxed mb-4 italic"
        style={{ color: 'var(--color-text-secondary)', fontSize: '0.97rem' }}
      >
        {block.narrative}
      </p>

      {!showMoral ? (
        <button
          onClick={() => setShowMoral(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          style={{
            background: 'rgba(76,31,212,0.15)',
            color: 'var(--color-primary-light)',
            border: '1px solid rgba(76,31,212,0.3)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(76,31,212,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(76,31,212,0.15)')}
        >
          Révéler la morale →
        </button>
      ) : (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(76,31,212,0.12)',
            border: '1px solid rgba(76,31,212,0.25)',
            color: 'var(--color-primary-light)',
          }}
        >
          <span className="font-semibold">Morale : </span>
          {block.moral}
        </div>
      )}
    </div>
  );
}
