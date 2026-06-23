export interface UserProgress {
  xp: number;
  xpToNextLevel: number;
  level: number;
  streak: number;
  completedCourses: number;
  totalCourses: number;
}

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;        // 0-100
  available: boolean;
  route: string;
}

export interface RecentActivity {
  id: string;
  type: 'course_completed' | 'quiz_passed' | 'prompt_scored' | 'course_generated';
  label: string;
  xpEarned: number;
  timestamp: string;       // ISO string
  href?: string;           // lien vers l'activité (optionnel)
}
