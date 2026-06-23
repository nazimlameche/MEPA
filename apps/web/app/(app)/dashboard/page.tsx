import { auth } from '@/lib/auth';
import { mockModules } from '@/lib/mock/dashboard-data';
import { mockCourseList } from '@/lib/mock/theory-data';
import { apiClient } from '@/lib/api-client';
import {
  EMPTY_PROGRESS,
  apiStatsToProgress,
  computeModuleProgress,
  toRecentActivity,
  type ApiStats,
  type ActivityItemDto,
  type CourseProgressDto,
} from '@/lib/progress/derive';
import XPBar from '@/components/dashboard/XPBar';
import StatCard from '@/components/dashboard/StatCard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import type { UserProgress, ModuleSummary } from '@/lib/types/dashboard';
import AlKoGreeting from '@/components/mascot/AlKoGreeting';

export default async function DashboardPage() {
  const session   = await auth();
  const token     = session?.accessToken;
  const firstName = session?.user?.name?.split(' ')[0] ?? 'toi';

  let progress: UserProgress      = EMPTY_PROGRESS;
  let modulesWithProgress: ModuleSummary[] = mockModules.map(m => ({ ...m, progress: 0 }));
  let recentActivities            = toRecentActivity([], mockCourseList);

  if (token) {
    try {
      const [statsData, coursesData, activityData] = await Promise.all([
        apiClient.get<ApiStats>('/progress/stats', token),
        apiClient.get<CourseProgressDto[]>('/progress/courses', token),
        apiClient.get<ActivityItemDto[]>('/progress/activity', token),
      ]);

      progress = apiStatsToProgress(statsData);

      const completedIds   = coursesData.filter(c => c.status === 'completed').map(c => c.courseId);
      const moduleProgress = computeModuleProgress(completedIds, mockModules, mockCourseList);
      modulesWithProgress  = mockModules.map(m => ({ ...m, progress: moduleProgress[m.id] ?? 0 }));

      recentActivities = toRecentActivity(activityData, mockCourseList);
    } catch {
      // API unavailable — show zeros, never mocks
    }
  }

  const totalXpDisplay = progress.xp + (progress.level - 1) * (progress.xpToNextLevel);

  return (
    <PageContainer size="wide">
      <header className="mb-8" style={{ overflow: 'visible' }}>
        <div className="flex items-center gap-3 flex-wrap" style={{ overflow: 'visible' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, lineHeight: 1.2 }}>
            Bonjour, {firstName} !
          </h1>
          <div style={{ marginTop: 30 }}><AlKoGreeting /></div>
        </div>
        <p style={{ color: 'var(--color-body)', fontSize: '0.97rem', maxWidth: '56ch', marginTop: 6 }}>
          Continue ta progression — tu es à {progress.xpToNextLevel - progress.xp} XP du niveau {progress.level + 1}.
        </p>
      </header>

      <Section>
        <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level} />
      </Section>

      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Jours consécutifs"  value={progress.streak}           sub="Streak actuel" />
          <StatCard label="XP total"           value={totalXpDisplay}            sub={`Niveau ${progress.level}`} />
          <StatCard label="Cours terminés"     value={progress.completedCourses}  sub={`sur ${progress.totalCourses}`} />
          <StatCard label="Taux de complétion" value={`${Math.round((progress.completedCourses / Math.max(progress.totalCourses, 1)) * 100)}%`} sub="Objectif : 100%" />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Modules">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modulesWithProgress.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
            </div>
          </Section>
        </div>
        <div>
          <Section title="Activité récente">
            <ActivityFeed activities={recentActivities} />
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
