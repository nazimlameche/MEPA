import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { Parcours } from '@/lib/types/custom-course';
import PageContainer from '@/components/layout/PageContainer';
import ParcoursDashboard from '@/components/custom-course/ParcoursDashboard';

interface PageProps {
  params: Promise<{ parcoursId: string }>;
}

export default async function ParcoursPage({ params }: PageProps) {
  const session = await auth();
  const token   = session?.accessToken;
  if (!token) redirect('/login');

  const { parcoursId } = await params;

  let parcours: Parcours;
  try {
    parcours = await apiClient.get<Parcours>(`/custom-course/parcours/${parcoursId}`, token);
  } catch {
    notFound();
  }

  return (
    <PageContainer size="default">
      <ParcoursDashboard parcours={parcours} />
    </PageContainer>
  );
}
