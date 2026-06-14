import Skeleton from '@/components/ui/Skeleton';

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
    >
      {children}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-5 md:px-8 py-8 md:py-10">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-52 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* XPBar skeleton */}
      <div className="mb-6">
        <CardShell>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7" style={{ borderRadius: '6px' }} />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-1.5 w-full" style={{ borderRadius: '2px' }} />
          <Skeleton className="h-3 w-36 mt-2" />
        </CardShell>
      </div>

      {/* StatCards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map(i => (
          <CardShell key={i}>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </CardShell>
        ))}
      </div>

      {/* Modules + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => (
              <CardShell key={i}>
                <Skeleton className="h-5 w-20 mb-4" style={{ borderRadius: '8px' }} />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                <Skeleton className="h-1 w-full" style={{ borderRadius: '2px' }} />
              </CardShell>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-32 mb-4" />
          <CardShell>
            <div className="flex flex-col gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 flex-shrink-0" style={{ borderRadius: '4px' }} />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
