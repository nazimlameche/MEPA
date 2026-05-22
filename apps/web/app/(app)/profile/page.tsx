import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User, Trophy, Flame } from 'lucide-react';
import LevelCard from '@/components/gamification/LevelCard';
import StreakBadge from '@/components/gamification/StreakBadge';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const roleLabels: Record<string, string> = {
    student: 'Élève',
    teacher: 'Enseignant',
    admin: 'Administrateur',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Mon Profil</h1>

      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{session.user.name ?? session.user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">{roleLabels[session.user.role ?? 'student'] ?? 'Élève'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm flex items-center gap-3">
          <Trophy className="h-6 w-6 text-warning-500" />
          <div>
            <p className="text-xs text-gray-400">XP Total</p>
            <p className="font-display font-bold text-gray-900">{session.user.xp ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm flex items-center gap-3">
          <Flame className="h-6 w-6 text-danger-500" />
          <div>
            <p className="text-xs text-gray-400">Série</p>
            <p className="font-display font-bold text-gray-900">{session.user.streakDays ?? 0} jours</p>
          </div>
        </div>
      </div>

      <LevelCard level={session.user.level ?? 1} currentXP={session.user.xp ?? 0} />
      <StreakBadge days={session.user.streakDays ?? 0} />
    </div>
  );
}
