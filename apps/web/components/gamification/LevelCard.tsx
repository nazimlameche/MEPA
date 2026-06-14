import { Trophy } from 'lucide-react';
import XPBar from './XPBar';
import { LEVEL_THRESHOLDS } from '@ai-edu/shared';

interface LevelCardProps {
  level: number;
  currentXP: number;
}

export default function LevelCard({ level, currentXP }: LevelCardProps) {
  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const xpForNextLevel    = LEVEL_THRESHOLDS[level] ?? xpForCurrentLevel + 500;
  const xpInLevel         = currentXP - xpForCurrentLevel;
  const xpNeeded          = xpForNextLevel - xpForCurrentLevel;

  return (
    <div
      className="p-5 space-y-3"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 flex items-center justify-center flex-shrink-0"
          style={{
            background:   'var(--color-streak-soft)',
            borderRadius: '8px',
          }}
        >
          <Trophy className="h-5 w-5" style={{ color: 'var(--color-streak)' }} aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>
            Niveau {level}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Encore {xpNeeded - xpInLevel} XP pour le niveau suivant
          </p>
        </div>
      </div>
      <XPBar currentXP={xpInLevel} maxXP={xpNeeded} level={level} />
    </div>
  );
}
