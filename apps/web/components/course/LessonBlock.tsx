import type { ContentBlock } from '@/types';

interface LessonBlockProps {
  block: ContentBlock;
}

export default function LessonBlock({ block }: LessonBlockProps) {
  if (block.type === 'text') {
    return (
      <div className="prose prose-sm max-w-none bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
        <p className="text-gray-700 leading-relaxed">{block.content}</p>
      </div>
    );
  }

  if (block.type === 'heading') {
    return (
      <h2 className="font-display text-xl font-bold text-gray-900">{block.content}</h2>
    );
  }

  if (block.type === 'callout') {
    return (
      <div className="flex gap-3 rounded-2xl bg-primary-50 border border-primary-100 p-4">
        <span className="text-xl">{block.emoji ?? '💡'}</span>
        <p className="text-sm text-primary-800 leading-relaxed">{block.content}</p>
      </div>
    );
  }

  return null;
}
