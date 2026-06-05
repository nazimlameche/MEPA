import type { RecentActivity } from '@/lib/types/dashboard';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const TYPE_CONFIG: Record<RecentActivity['type'], { emoji: string; color: string }> = {
  course_completed: { emoji: '📗', color: 'rgba(16,185,129,0.12)' },
  quiz_passed:      { emoji: '✅', color: 'rgba(76,31,212,0.12)' },
  prompt_scored:    { emoji: '🏆', color: 'rgba(245,158,11,0.12)' },
  course_generated: { emoji: '✨', color: 'rgba(123,82,240,0.12)' },
};

export default function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <p
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Activité récente
      </p>

      {activities.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Aucune activité pour l&apos;instant. Lance-toi !
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map(a => {
            const cfg = TYPE_CONFIG[a.type];
            return (
              <div key={a.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: cfg.color }}
                >
                  {cfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {a.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {timeAgo(a.timestamp)}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold flex-shrink-0"
                  style={{ color: 'var(--color-xp)' }}
                >
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
