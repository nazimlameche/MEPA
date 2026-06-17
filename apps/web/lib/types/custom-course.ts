import type { CourseBlock } from './course';

export type ChapterKey =
  | 'comprendre-ia'
  | 'bon-prompting'
  | 'atelier-prompting'
  | 'securite'
  | 'impact-environnemental'
  | 'ethique';

export type ChapterStatus = 'pending' | 'generating' | 'ready' | 'error' | 'completed';

export type ParcoursLevel = 'college' | 'lycee' | 'adulte';

export interface ChapterMeta {
  index: number;
  key: ChapterKey;
  defaultTitle: string;
  icon: string;
  xpReward: number;
}

export const CHAPTER_TEMPLATES: ChapterMeta[] = [
  { index: 0, key: 'comprendre-ia',         defaultTitle: "Comprendre l'IA",        icon: '🧠', xpReward: 20 },
  { index: 1, key: 'bon-prompting',          defaultTitle: 'Bon prompting',          icon: '✍️', xpReward: 20 },
  { index: 2, key: 'atelier-prompting',      defaultTitle: 'Atelier prompting',      icon: '🎯', xpReward: 25 },
  { index: 3, key: 'securite',               defaultTitle: 'Sécurité & données',     icon: '🔒', xpReward: 20 },
  { index: 4, key: 'impact-environnemental', defaultTitle: 'Impact environnemental', icon: '🌍', xpReward: 20 },
  { index: 5, key: 'ethique',                defaultTitle: 'Éthique & usages',       icon: '⚖️', xpReward: 25 },
];

export interface GeneratedChapterContent {
  title: string;
  blocks: CourseBlock[];
}

export interface ParcoursChapter {
  id: string;
  chapterIndex: number;
  chapterKey: ChapterKey;
  title: string;
  status: ChapterStatus;
  content: GeneratedChapterContent | null;
  xpEarned: number;
  completedAt: string | null;
}

export interface Parcours {
  id: string;
  theme: string;
  level: ParcoursLevel;
  chapters: ParcoursChapter[];
  createdAt: string;
  expiresAt: string;
}
