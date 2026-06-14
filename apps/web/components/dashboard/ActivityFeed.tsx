import type { RecentActivity } from '@/lib/types/dashboard';
import { CheckCircle, Zap, BookOpen, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const TYPE_CONFIG: Record<RecentActivity['type'], { icon: LucideIcon; color: string }> = {
  course_completed: { icon: BookOpen,    color: 'var(--color-complete)' },
  quiz_passed:      { icon: CheckCircle, color: 'var(--color-accent)' },
  prompt_scored:    { icon: Zap,         color: 'var(--color-streak)' },
  course_generated: { icon: Sparkles,    color: 'var(--color-muted)' },
};

export default function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  return (
    <div
      className="p-5"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      {activities.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Aucune activité pour l&apos;instant. Lance-toi !
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {activities.map(a => {
            const { icon: Icon, color } = TYPE_CONFIG[a.type];
            return (
              <div key={a.id} className="flex items-center gap-3">
                <Icon size={16} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>
                    {a.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {timeAgo(a.timestamp)}
                  </p>
                </div>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--color-complete)' }}>
                  +{a.xpEarned} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
