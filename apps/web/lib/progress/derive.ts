import type { UserProgress, ModuleSummary, RecentActivity } from '@/lib/types/dashboard';
import type { CourseListItem } from '@/lib/types/course';

export const XP_PER_LEVEL = 500;

// Total courses across all modules (theory + prompting). Used for EMPTY_PROGRESS.
// These are the catalogue counts — no DB dependency.
export const TOTAL_THEORY_COURSES    = 6;
export const TOTAL_PROMPTING_COURSES = 5;
export const TOTAL_CATALOGUE_COURSES = TOTAL_THEORY_COURSES + TOTAL_PROMPTING_COURSES;

export const EMPTY_PROGRESS: UserProgress = {
  xp:               0,
  xpToNextLevel:    XP_PER_LEVEL,
  level:            1,
  streak:           0,
  completedCourses: 0,
  totalCourses:     TOTAL_CATALOGUE_COURSES,
};

export interface ApiStats {
  totalXp:          number;
  level:            number;
  currentStreak:    number;
  completedCourses: number;
}

export interface ActivityItemDto {
  id:        string;
  type:      'course_completed' | 'prompt_scored' | 'course_generated';
  courseId:  string;
  xpEarned:  number;
  timestamp: string; // ISO string from JSON
}

export interface CourseProgressDto {
  courseId:    string;
  status:      'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export function apiStatsToProgress(api: ApiStats): UserProgress {
  return {
    xp:               api.totalXp % XP_PER_LEVEL,
    xpToNextLevel:    XP_PER_LEVEL,
    level:            api.level,
    streak:           api.currentStreak,
    completedCourses: api.completedCourses,
    totalCourses:     TOTAL_CATALOGUE_COURSES,
  };
}

/**
 * Derives module-level progress percentage from completed course IDs.
 * Theory:    completed theory IDs / total theory courses * 100
 * Prompting: completed prompting-* IDs / total prompting courses * 100
 * Others:    0 (no progress tracking defined yet)
 */
export function computeModuleProgress(
  completedCourseIds: string[],
  modules: Pick<ModuleSummary, 'id'>[],
  catalog: CourseListItem[],
): Record<string, number> {
  const completedSet = new Set(completedCourseIds);

  const theoryCompleted    = catalog.filter(c => completedSet.has(c.id)).length;
  const promptingCompleted = completedCourseIds.filter(id => id.startsWith('prompting-')).length;

  const result: Record<string, number> = {};
  for (const mod of modules) {
    if (mod.id === 'theory') {
      result[mod.id] = TOTAL_THEORY_COURSES > 0
        ? Math.round((theoryCompleted / TOTAL_THEORY_COURSES) * 100)
        : 0;
    } else if (mod.id === 'prompting') {
      result[mod.id] = TOTAL_PROMPTING_COURSES > 0
        ? Math.round((promptingCompleted / TOTAL_PROMPTING_COURSES) * 100)
        : 0;
    } else {
      result[mod.id] = 0;
    }
  }
  return result;
}

const ACTIVITY_LABELS: Record<string, string> = {
  course_completed:  'Cours terminé',
  prompt_scored:     'Prompt évalué',
  course_generated:  'Cours personnalisé généré',
};

/**
 * Converts backend ActivityItemDto array to RecentActivity for the UI.
 * Labels are resolved from the front-end catalog; fallback to generic label by type.
 */
export function toRecentActivity(
  items: ActivityItemDto[],
  catalog: CourseListItem[],
): RecentActivity[] {
  const catalogMap = new Map(catalog.map(c => [c.id, c.title]));
  return items.map(item => {
    const bareId   = item.courseId.replace(/^prompting-/, '').replace(/^custom-/, '');
    const title    = catalogMap.get(item.courseId) ?? catalogMap.get(bareId);
    const fallback = ACTIVITY_LABELS[item.type] ?? 'Activité';
    return {
      id:        item.id,
      type:      item.type,
      label:     title ? `${fallback} — ${title}` : fallback,
      xpEarned:  item.xpEarned,
      timestamp: item.timestamp,
    };
  });
}
