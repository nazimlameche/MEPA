import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { Parcours } from '@/lib/types/custom-course';
import PageContainer from '@/components/layout/PageContainer';
import ChapterReader from '@/components/custom-course/ChapterReader';
import LazyChapterLoader from '@/components/custom-course/LazyChapterLoader';

interface PageProps {
  params: Promise<{ parcoursId: string; chapterIndex: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const session = await auth();
  const token   = session?.accessToken;
  if (!token) redirect('/login');

  const { parcoursId, chapterIndex } = await params;
  const idx = Number(chapterIndex);

  if (isNaN(idx) || idx < 0 || idx > 5) notFound();

  let parcours: Parcours;
  try {
    parcours = await apiClient.get<Parcours>(`/custom-course/parcours/${parcoursId}`, token);
  } catch {
    notFound();
  }

  const chapter = parcours.chapters.find(c => c.chapterIndex === idx);
  if (!chapter) notFound();

  if (chapter.status === 'ready' || chapter.status === 'completed') {
    return (
      <PageContainer size="narrow">
        <ChapterReader chapter={chapter} parcoursId={parcoursId} />
      </PageContainer>
    );
  }

  // pending | generating | error → lazy generation (LazyChapterLoader handles retry on error)
  return (
    <PageContainer size="narrow">
      <LazyChapterLoader chapter={chapter} parcoursId={parcoursId} />
    </PageContainer>
  );
}
