interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  moderated?: boolean;
}

export default function MessageBubble({ role, content, moderated }: MessageBubbleProps) {
  const isUser = role === 'user';

  const bubbleStyle: React.CSSProperties = isUser
    ? {
        background:   'var(--color-accent)',
        color:        '#fff',
        borderRadius: '8px 8px 2px 8px',
      }
    : moderated
    ? {
        background:   'var(--color-error-soft)',
        color:        'var(--color-error)',
        border:       '1px solid rgba(185,28,28,0.2)',
        borderRadius: '8px 8px 8px 2px',
      }
    : {
        background:   'var(--color-surface)',
        color:        'var(--color-ink)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px 8px 8px 2px',
      };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed"
        style={bubbleStyle}
      >
        {content}
      </div>
    </div>
  );
}
