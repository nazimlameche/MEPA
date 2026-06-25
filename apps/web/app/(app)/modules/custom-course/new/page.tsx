import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';
import NewParcoursFlow from '@/components/custom-course/NewParcoursFlow';

export default async function NewParcourPage() {
  const session = await auth();
  if (!session?.accessToken) redirect('/login');

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Nouveau parcours"
        subtitle="Choisis un thème et découvre l'IA à travers ce qui te passionne."
      />
      <Section>
        <NewParcoursFlow />
      </Section>
    </PageContainer>
  );
}
