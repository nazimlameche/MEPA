'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ContentBlock } from '@/types';

interface QuizWidgetProps {
  block: ContentBlock;
  courseId: string;
}

export default function QuizWidget({ block, courseId: _courseId }: QuizWidgetProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = block.options ?? [];
  const correct = block.correctIndex ?? 0;
  const isCorrect = selected === correct;

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-2">
        <span className="text-lg">❓</span>
        <p className="font-semibold text-gray-900">{block.content}</p>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls = 'rounded-xl border px-4 py-2.5 text-sm text-left w-full transition-all ';
          if (!submitted) {
            cls += selected === i
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-surface-200 hover:border-primary-300';
          } else if (i === correct) {
            cls += 'border-success-500 bg-success-50 text-success-600';
          } else if (i === selected) {
            cls += 'border-danger-500 bg-danger-50 text-danger-500';
          } else {
            cls += 'border-surface-200 opacity-50';
          }

          return (
            <button key={i} className={cls} onClick={() => !submitted && setSelected(i)} disabled={submitted}>
              {opt}
            </button>
          );
        })}
      </div>

      {!submitted && selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="rounded-xl bg-primary-500 text-white text-sm font-semibold px-5 py-2 hover:bg-primary-600 transition"
        >
          Valider
        </button>
      )}

      {submitted && (
        <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-success-600' : 'text-danger-500'}`}>
          {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {isCorrect ? 'Bonne réponse ! +10 XP' : `Incorrect. ${block.explanation ?? ''}`}
        </div>
      )}
    </div>
  );
}
