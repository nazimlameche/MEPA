import Skeleton from '@/components/ui/Skeleton';

export default function ModuleLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-5 py-8">
      {/* Breadcrumb + title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-56 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* CourseCard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex flex-col gap-3 p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
          >
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-10 w-10 flex-shrink-0" style={{ borderRadius: '8px' }} />
              <Skeleton className="h-5 w-20" style={{ borderRadius: '6px' }} />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-16 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
