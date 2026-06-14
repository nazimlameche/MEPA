'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, RotateCcw, Sparkles } from 'lucide-react';
import type { GeneratedCourseOutput, SavedCourse } from '@/lib/types/custom-course';
import CourseForm from '@/components/custom-course/CourseForm';
import BlockRenderer from '@/components/course/BlockRenderer';
import { mockSavedCourses } from '@/lib/mock/custom-course-data';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import Section from '@/components/layout/Section';

type PageState = 'form' | 'reading' | 'done';

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default function CustomCoursePage() {
  const [state, setState]               = useState<PageState>('form');
  const [generated, setGenerated]       = useState<GeneratedCourseOutput | null>(null);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [savedCourses]                  = useState<SavedCourse[]>(mockSavedCourses);
  const [validatedBlocks, setValidated] = useState<Set<number>>(new Set());

  const INTERACTIVE = new Set(['quiz', 'fill_blank']);

  const handleGenerated = (course: GeneratedCourseOutput) => {
    setGenerated(course);
    setCurrentBlock(0);
    setValidated(new Set());
    setState('reading');
  };

  const handleValidate = () => {
    setValidated(v => new Set(v).add(currentBlock));
  };

  const canContinue = generated
    ? !INTERACTIVE.has(generated.blocks[currentBlock]?.type ?? '') ||
      validatedBlocks.has(currentBlock)
    : false;

  const isLast = generated ? currentBlock === generated.blocks.length - 1 : false;

  const goNext = () => {
    if (isLast) { setState('done'); return; }
    setCurrentBlock(b => b + 1);
  };

  if (state === 'done' && generated) {
    return (
      <PageContainer size="narrow">
        <div className="flex flex-col items-center text-center gap-6 py-16">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '8px' }}>
              Cours terminé
            </h1>
            <p style={{ color: 'var(--color-body)' }}>
              Tu as terminé &quot;{generated.title}&quot;
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setState('form')}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors duration-200"
              style={{
                background:   'var(--color-surface)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px',
                color:        'var(--color-body)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Nouveau cours
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 font-semibold text-sm transition-colors duration-200"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (state === 'reading' && generated) {
    return (
      <PageContainer size="narrow">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setState('form')}
              className="flex items-center gap-1.5 text-sm transition-colors duration-200"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-body)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Nouveau cours
            </button>
            <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <Clock size={12} aria-hidden="true" />
              ~{generated.estimated_duration_minutes} min
            </span>
          </div>

          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 600 }}>
              {generated.title}
            </h1>
            <div className="flex gap-1 mt-4">
              {generated.blocks.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 transition-colors duration-300"
                  style={{
                    background:   i < currentBlock ? 'var(--color-complete)' : i === currentBlock ? 'var(--color-accent)' : 'var(--color-border)',
                    borderRadius: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlock}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <BlockRenderer
                block={generated.blocks[currentBlock]}
                onValidate={handleValidate}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-end pb-8">
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="px-7 py-3 font-semibold text-sm transition-colors duration-200"
              style={{
                background:   canContinue ? 'var(--color-accent)' : 'var(--color-bg)',
                color:        canContinue ? '#fff' : 'var(--color-muted)',
                cursor:       canContinue ? 'pointer' : 'not-allowed',
                border:       `1px solid ${canContinue ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '8px',
              }}
              onMouseEnter={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (canContinue) e.currentTarget.style.background = 'var(--color-accent)'; }}
            >
              {isLast ? 'Terminer la leçon' : 'Continuer'}
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="default">
      <PageHeader
        title="Cours sur-mesure"
        subtitle="Dis-nous ce que tu aimes — on génère un cours sur l'IA fait pour toi."
      />

      <Section>
        <div
          className="p-8"
          style={{
            background:   'var(--color-surface)',
            border:       '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
        >
          <CourseForm onGenerated={handleGenerated} />
        </div>
      </Section>

      {savedCourses.length > 0 && (
        <Section title="Cours précédents">
          <div className="flex flex-col gap-3">
            {savedCourses.map(course => (
              <div
                key={course.id}
                className="p-5 flex items-center gap-4"
                style={{
                  background:   'var(--color-surface)',
                  border:       '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-ink)' }}>
                    {course.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {timeAgo(course.generatedAt)} · ~{course.estimatedMinutes} min
                  </p>
                </div>
                <button
                  onClick={() => handleGenerated({
                    title: course.title,
                    level: course.level,
                    estimated_duration_minutes: course.estimatedMinutes,
                    blocks: course.blocks,
                  })}
                  className="px-4 py-2 text-sm font-medium transition-colors duration-200 flex-shrink-0"
                  style={{
                    background:   'var(--color-bg)',
                    color:        'var(--color-muted)',
                    border:       '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  Revoir
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
