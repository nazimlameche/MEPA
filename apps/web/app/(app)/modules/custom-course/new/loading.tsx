import Skeleton from '@/components/ui/Skeleton';

export default function NewParcoursLoading() {
  return (
    <div className="max-w-xl mx-auto w-full px-5 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-80 mb-8" />
      <div
        className="p-6 space-y-5"
        style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-surface-border)', borderRadius: '12px' }}
      >
        <Skeleton className="h-4 w-56 mb-1" />
        <Skeleton className="h-11 w-full" style={{ borderRadius: '8px' }} />
        <Skeleton className="h-4 w-24 mb-1 mt-2" />
        <div className="flex gap-2">
          {[0, 1, 2].map(i => <Skeleton key={i} className="flex-1 h-10" style={{ borderRadius: '8px' }} />)}
        </div>
        <Skeleton className="h-11 w-full mt-2" style={{ borderRadius: '8px' }} />
      </div>
    </div>
  );
}
