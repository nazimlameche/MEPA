import { auth } from '@/lib/auth';
import { mockUserProgress, mockModules, mockRecentActivity } from '@/lib/mock/dashboard-data';
import XPBar from '@/components/dashboard/XPBar';
import StatCard from '@/components/dashboard/StatCard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default async function DashboardPage() {
  const session  = await auth();
  const progress = mockUserProgress;
  const modules  = mockModules;
  const activity = mockRecentActivity;

  const firstName = session?.user?.name?.split(' ')[0] ?? 'toi';

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* En-tête */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}
        >
          Bonjour, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Continue ta progression — tu es à {progress.xpToNextLevel - progress.xp} XP du niveau {progress.level + 1}.
        </p>
      </div>

      {/* XP Bar */}
      <XPBar
        xp={progress.xp}
        xpToNextLevel={progress.xpToNextLevel}
        level={progress.level}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          emoji="🔥"
          label="Jours consécutifs"
          value={progress.streak}
          sub="Streak actuel"
        />
        <StatCard
          emoji="⚡"
          label="XP total"
          value={progress.xp}
          sub={`Niveau ${progress.level}`}
        />
        <StatCard
          emoji="📗"
          label="Cours terminés"
          value={progress.completedCourses}
          sub={`sur ${progress.totalCourses}`}
        />
        <StatCard
          emoji="🎯"
          label="Taux de complétion"
          value={`${Math.round((progress.completedCourses / progress.totalCourses) * 100)}%`}
          sub="Objectif : 100%"
        />
      </div>

      {/* Modules + Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Modules — 2/3 de la largeur */}
        <div className="lg:col-span-2 space-y-4">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map(mod => (
              <ModuleCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>

        {/* Activité — 1/3 */}
        <div className="space-y-4">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Récent
          </h2>
          <ActivityFeed activities={activity} />
        </div>
      </div>
    </div>
  );
}
