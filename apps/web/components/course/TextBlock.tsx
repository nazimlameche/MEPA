import type { TextBlock } from '@/lib/types/course';

function renderText(content: string): React.ReactNode[] {
  return content.split('\n\n').map((paragraph, pi) => (
    <p
      key={pi}
      className="leading-relaxed mb-4 last:mb-0"
      style={{ color: 'var(--color-body)', fontSize: '1rem' }}
      dangerouslySetInnerHTML={{
        __html: paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-ink)">$1</strong>')
          .replace(/\n/g, '<br />'),
      }}
    />
  ));
}

export default function TextBlockComponent({ block }: { block: TextBlock }) {
  return (
    <div
      className="p-6"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      {renderText(block.content)}
    </div>
  );
}
