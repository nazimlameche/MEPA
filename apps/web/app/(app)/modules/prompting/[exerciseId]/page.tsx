import { notFound } from 'next/navigation';
import { mockExercises } from '@/lib/mock/prompting-data';
import PromptingExercise from '@/components/prompting/PromptingExercise';
import PageContainer from '@/components/layout/PageContainer';

interface Props {
  params: Promise<{ exerciseId: string }>;
}

export default async function PromptingExercisePage({ params }: Props) {
  const { exerciseId } = await params;
  const exercise = mockExercises.find(e => e.id === exerciseId);
  if (!exercise) notFound();

  return (
    <PageContainer size="narrow">
      <PromptingExercise exercise={exercise} />
    </PageContainer>
  );
}
