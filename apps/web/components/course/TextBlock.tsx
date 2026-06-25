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
          // Fallback markdown renderers — garde-fous si Mistral dépasse les consignes de texte brut
          .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1" style="color:var(--color-ink)">$1</h3>')
          .replace(/^## (.+)$/gm,  '<h2 class="text-lg font-semibold mt-5 mb-2" style="color:var(--color-ink)">$1</h2>')
          .replace(/^# (.+)$/gm,   '<h1 class="text-xl font-bold mt-6 mb-2" style="color:var(--color-ink)">$1</h1>')
          .replace(/\*(.*?)\*/g,   '<em>$1</em>')
          .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
          .replace(/^> (.+)$/gm,   '<blockquote class="border-l-4 pl-3 italic" style="border-color:var(--color-border);color:var(--color-muted)">$1</blockquote>')
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
