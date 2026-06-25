import Skeleton from '@/components/ui/Skeleton';

export default function CustomCourseLoading() {
  return (
    <div className="max-w-5xl mx-auto w-full px-5 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-72 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" style={{ borderRadius: '8px' }} />
          <Skeleton className="h-8 w-8" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      {/* Progress bar */}
      <Skeleton className="h-2 w-full mb-6" style={{ borderRadius: '4px' }} />

      {/* Chapter grid (6 cards) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4"
            style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-surface-border)', borderRadius: '12px' }}
          >
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-6 w-6" style={{ borderRadius: '4px' }} />
              <Skeleton className="h-5 w-16" style={{ borderRadius: '6px' }} />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
