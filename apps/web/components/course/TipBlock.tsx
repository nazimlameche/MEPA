import type { TipBlock } from '@/lib/types/course';

export default function TipBlockComponent({ block }: { block: TipBlock }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex gap-3 items-start"
      style={{
        background: 'rgba(245,158,11,0.07)',
        border: '1px solid rgba(245,158,11,0.2)',
      }}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {block.content}
      </p>
    </div>
  );
}
