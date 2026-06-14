import Skeleton from '@/components/ui/Skeleton';

export default function CourseLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 px-5 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Level badge + title */}
      <div>
        <Skeleton className="h-5 w-20 mb-2" style={{ borderRadius: '6px' }} />
        <Skeleton className="h-8 w-4/5 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Lesson blocks */}
      <div className="space-y-4">
        {[80, 56, 96, 64, 72].map((w, i) => (
          <div
            key={i}
            className="p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
          >
            <Skeleton className="h-4 mb-3" style={{ width: `${w}%` }} />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 mb-2" style={{ width: '91.666%' }} />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
