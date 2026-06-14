import type { TipBlock } from '@/lib/types/course';

export default function TipBlockComponent({ block }: { block: TipBlock }) {
  return (
    <div
      className="px-5 py-4 flex gap-3 items-start"
      style={{
        background:  'var(--color-surface)',
        border:      '1px solid var(--color-border)',
        borderLeft:  '2px solid var(--color-accent)',
        borderRadius: '8px',
      }}
    >
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-body)' }}>
        {block.content}
      </p>
    </div>
  );
}
