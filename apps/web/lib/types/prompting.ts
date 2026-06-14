export interface PromptExercise {
  id: string;
  title: string;
  subject: string;
  context: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  xpReward: number;
  completed: boolean;
  bestScore: number | null;
}

export interface ScoreStep {
  score: number;
  passed: boolean;
  feedback: string;
  suggestions: string[];
}

export interface PiiCheckStep {
  score: number;
  passed: boolean;
  pii_found: string[];
  feedback: string;
}

export interface PromptScoreOutput {
  total_score: number;
  passed: boolean;
  steps: {
    structure:     ScoreStep;
    pii_check:     PiiCheckStep;
    output_format: ScoreStep;
  };
  global_feedback: string;
}
