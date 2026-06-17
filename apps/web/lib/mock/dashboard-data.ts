import type { UserProgress, ModuleSummary, RecentActivity } from '@/lib/types/dashboard';

// DEV ONLY — ne jamais rendre en production. Remplacé par EMPTY_PROGRESS depuis derive.ts.
export const mockUserProgress: UserProgress = {
  xp:               340,
  xpToNextLevel:    500,
  level:            3,
  streak:           5,
  completedCourses: 4,
  totalCourses:     12,
};

// Module metadata (title, icon, route, available). progress = 0 car recalculé à l'exécution.
export const mockModules: ModuleSummary[] = [
  {
    id:          'theory',
    title:       'Parcours Théorique',
    description: 'Leçons structurées, quiz et histoires illustrées.',
    icon:        '📚',
    progress:    0,
    available:   true,
    route:       '/modules/theory',
  },
  {
    id:          'prompting',
    title:       'Atelier Prompting',
    description: 'Rédige des prompts efficaces et sécurisés.',
    icon:        '✏️',
    progress:    0,
    available:   true,
    route:       '/modules/prompting',
  },
  {
    id:          'custom-course',
    title:       'Cours Sur-Mesure',
    description: "Des cours générés selon tes centres d'intérêt.",
    icon:        '🎯',
    progress:    0,
    available:   true,
    route:       '/modules/custom-course',
  },
  {
    id:          'sandbox',
    title:       'Bac à Sable',
    description: "Explore l'IA dans un espace sécurisé.",
    icon:        '🧪',
    progress:    0,
    available:   false,
    route:       '/modules/sandbox',
  },
];

// DEV ONLY — ne jamais rendre en production. Activité réelle depuis GET /progress/activity.
export const mockRecentActivity: RecentActivity[] = [
  {
    id:        '1',
    type:      'course_completed',
    label:     "Leçon terminée — Qu'est-ce qu'une IA ?",
    xpEarned:  10,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id:        '2',
    type:      'course_completed',
    label:     "Quiz réussi — Types d'IA",
    xpEarned:  15,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id:        '3',
    type:      'prompt_scored',
    label:     'Prompt parfait — Score 100/100',
    xpEarned:  25,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
