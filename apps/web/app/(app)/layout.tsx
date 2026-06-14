import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppSidebar from '@/components/layout/AppSidebar';
import AppNavbar from '@/components/layout/AppNavbar';
import AppTopbar from '@/components/layout/AppTopbar';
import NavigationProgress from '@/components/layout/NavigationProgress';
import { apiClient } from '@/lib/api-client';

interface ApiStats { totalXp: number; level: number; currentStreak: number; }

async function TopbarWithStats({ token, firstName }: { token: string; firstName: string | undefined }) {
  let stats: ApiStats = { totalXp: 0, level: 1, currentStreak: 0 };
  try { stats = await apiClient.get<ApiStats>('/progress/stats', token, 30); } catch { /* fallback */ }
  return (
    <AppTopbar
      streak={stats.currentStreak}
      xp={stats.totalXp}
      level={stats.level}
      userName={firstName}
    />
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const token = (session as { accessToken?: string }).accessToken;
  const firstName = session.user?.name?.split(' ')[0];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <NavigationProgress />
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppNavbar />
        <Suspense fallback={
          <AppTopbar streak={0} xp={0} level={1} userName={firstName} />
        }>
          {token && <TopbarWithStats token={token} firstName={firstName} />}
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
