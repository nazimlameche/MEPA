import type { LearningModuleConfig } from '../types/learning-module.interface.js';

export const MODULE_CONFIGS: LearningModuleConfig[] = [
  {
    id: 'theory',
    label: 'Parcours Théorique',
    category: 'theory',
    icon: 'BookOpen',
    route: '/modules/theory',
    requiredRoles: ['student', 'teacher', 'admin'],
    isActive: true,
    order: 1,
  },
  {
    id: 'prompting',
    label: 'Atelier Prompting',
    category: 'practice',
    icon: 'Wand2',
    route: '/modules/prompting',
    requiredRoles: ['student', 'teacher', 'admin'],
    isActive: true,
    order: 2,
  },
  {
    id: 'sandbox',
    label: 'Bac à Sable',
    category: 'sandbox',
    icon: 'MessageSquare',
    route: '/sandbox',
    requiredRoles: ['student', 'teacher', 'admin'],
    isActive: true,
    order: 3,
  },
  {
    id: 'custom-course',
    label: 'Cours Sur-Mesure',
    category: 'generated',
    icon: 'Sparkles',
    route: '/custom-course',
    requiredRoles: ['student', 'teacher'],
    isActive: true,
    order: 4,
  },
];

export const XP_REWARDS = {
  COURSE_COMPLETE: 50,
  QUIZ_CORRECT: 10,
  DAILY_STREAK: 20,
  FIRST_LOGIN: 5,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3650, 4700, 6000];
