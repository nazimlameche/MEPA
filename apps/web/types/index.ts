export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseEntity {
  id: string;
  moduleId: string;
  title: string;
  level: CourseLevel;
  tier: 'free' | 'premium';
  contentBlocks: ContentBlock[];
  xpReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContentBlockType = 'text' | 'heading' | 'callout' | 'quiz';

export interface ContentBlock {
  type: ContentBlockType;
  content: string;
  emoji?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface SandboxMessage {
  role: 'user' | 'assistant';
  content: string;
  moderated?: boolean;
}
