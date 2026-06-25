import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import NewParcoursFlow from '@/components/custom-course/NewParcoursFlow';
import type { ParcoursLevel } from '@/lib/types/custom-course';

function roleToParcoursLevel(role: string | undefined | null): ParcoursLevel {
  if (role === 'collegien') return 'college';
  if (role === 'lyceen')    return 'lycee';
  return 'adulte';
}

export default async function NewParcourPage() {
  const session = await auth();
  if (!session?.accessToken) redirect('/login');

  const defaultLevel = roleToParcoursLevel(session.user?.role);

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Nouveau parcours"
        subtitle="Choisis un thème et découvre l'IA à travers ce qui te passionne."
      />
      <Section>
        <NewParcoursFlow defaultLevel={defaultLevel} />
      </Section>
    </PageContainer>
  );
}
