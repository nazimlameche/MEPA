import { auth } from '@/lib/auth';
import { mockUserProgress, mockModules, mockRecentActivity } from '@/lib/mock/dashboard-data';
import { apiClient } from '@/lib/api-client';
import XPBar from '@/components/dashboard/XPBar';
import StatCard from '@/components/dashboard/StatCard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import type { UserProgress } from '@/lib/types/dashboard';

const XP_PER_LEVEL = 500;

interface ApiStats {
  totalXp:          number;
  level:            number;
  currentStreak:    number;
  completedCourses: number;
}

function apiStatsToProgress(api: ApiStats): UserProgress {
  return {
    xp:               api.totalXp % XP_PER_LEVEL,
    xpToNextLevel:    XP_PER_LEVEL,
    level:            api.level,
    streak:           api.currentStreak,
    completedCourses: api.completedCourses,
    totalCourses:     mockModules.length,
  };
}

export default async function DashboardPage() {
  const session   = await auth();
  const token     = session?.accessToken;
  const firstName = session?.user?.name?.split(' ')[0] ?? 'toi';

  let progress: UserProgress = mockUserProgress;
  if (token) {
    try {
      const apiStats = await apiClient.get<ApiStats>('/progress/stats', token);
      progress = apiStatsToProgress(apiStats);
    } catch {
      // API indisponible — fallback sur les mocks
    }
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        title={`Bonjour, ${firstName}`}
        subtitle={`Continue ta progression — tu es à ${progress.xpToNextLevel - progress.xp} XP du niveau ${progress.level + 1}.`}
      />

      <Section>
        <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level} />
      </Section>

      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Jours consécutifs"  value={progress.streak}           sub="Streak actuel" />
          <StatCard label="XP total"           value={progress.xp + (progress.level - 1) * XP_PER_LEVEL} sub={`Niveau ${progress.level}`} />
          <StatCard label="Cours terminés"     value={progress.completedCourses}  sub={`sur ${progress.totalCourses}`} />
          <StatCard label="Taux de complétion" value={`${Math.round((progress.completedCourses / progress.totalCourses) * 100)}%`} sub="Objectif : 100%" />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Modules">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockModules.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
            </div>
          </Section>
        </div>
        <div>
          <Section title="Activité récente">
            <ActivityFeed activities={mockRecentActivity} />
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
