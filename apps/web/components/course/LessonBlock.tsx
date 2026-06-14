import type { ContentBlock } from '@/types';

interface LessonBlockProps {
  block: ContentBlock;
}

export default function LessonBlock({ block }: LessonBlockProps) {
  if (block.type === 'text') {
    return (
      <div
        className="p-6"
        style={{
          background:   'var(--color-surface)',
          border:       '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
          {block.content}
        </p>
      </div>
    );
  }

  if (block.type === 'heading') {
    return (
      <h2 style={{ color: 'var(--color-ink)', fontSize: '1.25rem', fontWeight: 700 }}>
        {block.content}
      </h2>
    );
  }

  if (block.type === 'callout') {
    return (
      <div
        className="p-4"
        style={{
          background:  'var(--color-accent-soft)',
          border:      '1px solid var(--color-border)',
          borderLeft:  '2px solid var(--color-accent)',
          borderRadius: '8px',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {block.content}
        </p>
      </div>
    );
  }

  return null;
}
