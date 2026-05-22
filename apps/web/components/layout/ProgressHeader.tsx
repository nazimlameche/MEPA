import { auth } from '@/lib/auth';
import { Flame, Trophy } from 'lucide-react';
import XPBar from '@/components/gamification/XPBar';
import { LEVEL_THRESHOLDS } from '@ai-edu/shared';

export default async function ProgressHeader() {
  const session = await auth();
  const level = session?.user?.level ?? 1;
  const xp = session?.user?.xp ?? 0;
  const streak = session?.user?.streakDays ?? 0;

  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[level] ?? xpForCurrentLevel + 500;

  return (
    <header className="h-14 shrink-0 border-b border-surface-200 bg-white px-6 flex items-center gap-6">
      <div className="flex-1 max-w-xs">
        <XPBar currentXP={xp - xpForCurrentLevel} maxXP={xpForNextLevel - xpForCurrentLevel} level={level} />
      </div>
      <div className="flex items-center gap-4 text-sm shrink-0">
        <div className="flex items-center gap-1.5 font-medium text-warning-600">
          <Trophy className="h-4 w-4" />
          <span>{xp} XP</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 font-medium text-danger-500">
            <Flame className="h-4 w-4" />
            <span>{streak}</span>
          </div>
        )}
      </div>
    </header>
  );
}
