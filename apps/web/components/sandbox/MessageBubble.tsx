import { cn } from '@ai-edu/ui';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  moderated?: boolean;
}

export default function MessageBubble({ role, content, moderated }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-white border border-surface-200 text-gray-700 rounded-bl-sm shadow-sm',
          moderated && 'border-warning-500/30 bg-warning-50 text-warning-700',
        )}
      >
        {content}
      </div>
    </div>
  );
}
