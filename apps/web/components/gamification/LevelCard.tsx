import { Trophy } from 'lucide-react';
import XPBar from './XPBar';
import { LEVEL_THRESHOLDS } from '@ai-edu/shared';

interface LevelCardProps {
  level: number;
  currentXP: number;
}

export default function LevelCard({ level, currentXP }: LevelCardProps) {
  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[level] ?? xpForCurrentLevel + 500;
  const xpInLevel = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-warning-50 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-warning-500" />
        </div>
        <div>
          <p className="font-display font-bold text-gray-900">Niveau {level}</p>
          <p className="text-xs text-gray-400">Encore {xpNeeded - xpInLevel} XP pour le niveau suivant</p>
        </div>
      </div>
      <XPBar currentXP={xpInLevel} maxXP={xpNeeded} level={level} />
    </div>
  );
}
