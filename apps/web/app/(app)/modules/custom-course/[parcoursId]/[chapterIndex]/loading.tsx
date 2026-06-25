import Skeleton from '@/components/ui/Skeleton';

export default function ChapterLoading() {
  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-8 space-y-6">
      {/* Header nav */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" style={{ borderRadius: '4px' }} />
        <div className="flex-1" />
        <Skeleton className="h-4 w-10" style={{ borderRadius: '4px' }} />
      </div>

      {/* Title */}
      <div>
        <Skeleton className="h-7 w-3/4 mb-4" />
        {/* Block progress bar */}
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-1" style={{ borderRadius: '2px' }} />
          ))}
        </div>
      </div>

      {/* Content block skeleton */}
      <div
        className="p-5 space-y-3"
        style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-surface-border)', borderRadius: '12px' }}
      >
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Continue button */}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-32" style={{ borderRadius: '8px' }} />
      </div>
    </div>
  );
}
