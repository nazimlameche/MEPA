import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppSidebar from '@/components/layout/AppSidebar';
import AppNavbar from '@/components/layout/AppNavbar';
import AppTopbar from '@/components/layout/AppTopbar';
import { apiClient } from '@/lib/api-client';

interface ApiStats { totalXp: number; level: number; currentStreak: number; }

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const token = (session as { accessToken?: string }).accessToken;
  let stats: ApiStats = { totalXp: 0, level: 1, currentStreak: 0 };
  if (token) {
    try { stats = await apiClient.get<ApiStats>('/progress/stats', token); } catch { /* fallback */ }
  }

  const firstName = session.user?.name?.split(' ')[0];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppNavbar />
        <AppTopbar
          streak={stats.currentStreak}
          xp={stats.totalXp}
          level={stats.level}
          userName={firstName}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
