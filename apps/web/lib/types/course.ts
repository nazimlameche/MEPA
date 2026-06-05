export type CourseBlockType = 'text' | 'quiz' | 'fill_blank' | 'story' | 'tip';

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface FillBlankBlock {
  type: 'fill_blank';
  sentence: string;   // Le mot manquant est remplacé par "___"
  blank_word: string; // La réponse correcte
  hint: string;
}

export interface StoryBlock {
  type: 'story';
  title: string;
  narrative: string;
  moral: string;
}

export interface TipBlock {
  type: 'tip';
  content: string;
}

export type CourseBlock =
  | TextBlock
  | QuizBlock
  | FillBlankBlock
  | StoryBlock
  | TipBlock;

export interface Course {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  level: number;
  tier: number;
  xpReward: number;
  estimatedMinutes: number;
  blocks: CourseBlock[];
}

export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  level: number;
  tier: number;
  xpReward: number;
  estimatedMinutes: number;
  completed: boolean;
}
