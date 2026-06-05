import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppSidebar from '@/components/layout/AppSidebar';
import AppNavbar from '@/components/layout/AppNavbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppNavbar />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
