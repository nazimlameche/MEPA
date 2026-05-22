import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 border border-danger-500/20 px-3 py-1 text-sm font-semibold text-danger-500">
      <Flame className="h-3.5 w-3.5" />
      {days} jour{days > 1 ? 's' : ''} de suite
    </div>
  );
}
