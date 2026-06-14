import Skeleton from '@/components/ui/Skeleton';

export default function AppLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full px-5 md:px-8 py-8 md:py-10">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Content blocks */}
      <div className="space-y-4">
        <div
          className="p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
        >
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-4/5 mb-3" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div
              key={i}
              className="p-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
            >
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
