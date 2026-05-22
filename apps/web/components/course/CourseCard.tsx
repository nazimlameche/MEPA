import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import type { CourseEntity } from '@/types';

interface CourseCardProps {
  course: CourseEntity;
  moduleId: string;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-success-50 text-success-600',
  intermediate: 'bg-warning-50 text-warning-600',
  advanced: 'bg-danger-50 text-danger-500',
};

export default function CourseCard({ course, moduleId }: CourseCardProps) {
  return (
    <Link
      href={`/modules/${moduleId}/${course.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5 text-primary-500" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[course.level] ?? 'bg-surface-100 text-gray-500'}`}>
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-display font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
      </div>

      <div className="flex items-center gap-1 text-xs text-warning-500 font-medium">
        <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
        +{course.xpReward} XP
      </div>
    </Link>
  );
}
