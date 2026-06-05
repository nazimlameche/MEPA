import type { TextBlock } from '@/lib/types/course';

function renderText(content: string): React.ReactNode[] {
  return content.split('\n\n').map((paragraph, pi) => (
    <p
      key={pi}
      className="leading-relaxed mb-4 last:mb-0"
      style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}
      dangerouslySetInnerHTML={{
        __html: paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-text-primary)">$1</strong>')
          .replace(/\n/g, '<br />'),
      }}
    />
  ));
}

export default function TextBlockComponent({ block }: { block: TextBlock }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      {renderText(block.content)}
    </div>
  );
}
