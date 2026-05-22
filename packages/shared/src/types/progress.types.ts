export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  status: ProgressStatus;
  score: number;
  xpEarned: number;
  streakCount: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  answer: string;
  isCorrect: boolean;
  xpEarned: number;
  feedback: string;
  createdAt: Date;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  isActiveToday: boolean;
}

export interface XPEvent {
  userId: string;
  amount: number;
  reason: string;
  courseId?: string;
  exerciseId?: string;
  timestamp: Date;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
}
