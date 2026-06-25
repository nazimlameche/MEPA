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

export interface ScoreCriterion {
  score: number;
  feedback: string;
}

export interface SecurityCriterion extends ScoreCriterion {
  pii_found: string[];
}

export interface PromptScoreOutput {
  'clarté_objectif':  ScoreCriterion;
  contexte:           ScoreCriterion;
  format_sortie:      ScoreCriterion;
  'sécurité_données': SecurityCriterion;
  total_score:        number;
  global_feedback:    string;
  passed:             boolean;
}
