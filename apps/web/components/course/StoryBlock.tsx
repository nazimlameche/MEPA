'use client';

import { useState } from 'react';
import type { StoryBlock } from '@/lib/types/course';

export default function StoryBlockComponent({ block }: { block: StoryBlock }) {
  const [showMoral, setShowMoral] = useState(false);
  const [hovered, setHovered]     = useState(false);

  return (
    <div
      className="p-6"
      style={{
        background:   'var(--color-bg)',
        border:       '1px solid var(--color-border)',
        borderLeft:   '2px solid var(--color-accent)',
        borderRadius: '8px',
      }}
    >
      <p
        className="font-semibold mb-4"
        style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
      >
        {block.title}
      </p>

      <p
        className="leading-relaxed mb-5 italic"
        style={{ color: 'var(--color-body)', fontSize: '0.97rem' }}
      >
        {block.narrative}
      </p>

      {!showMoral ? (
        <button
          onClick={() => setShowMoral(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="text-sm font-medium px-4 py-2 transition-colors duration-200"
          style={{
            color:        hovered ? '#fff' : 'var(--color-accent)',
            background:   hovered ? 'var(--color-accent)' : 'var(--color-accent-soft)',
            border:       '1px solid var(--color-accent)',
            borderRadius: '8px',
          }}
        >
          Révéler la morale
        </button>
      ) : (
        <div
          className="px-4 py-3 text-sm"
          style={{
            background:   'var(--color-accent-soft)',
            border:       '1px solid rgba(15,118,110,0.2)',
            color:        'var(--color-accent)',
            borderRadius: '8px',
          }}
        >
          <span className="font-semibold">Morale : </span>
          {block.moral}
        </div>
      )}
    </div>
  );
}
