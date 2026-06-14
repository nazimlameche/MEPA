export type UserProfile = 'college' | 'lycee' | 'adulte' | 'teacher';

export const PROFILE_COURSES: Record<UserProfile, string[]> = {
  college: ['general', 'enfant'],
  lycee:   ['general', 'enfant'],
  adulte:  ['general', 'pro'],
  teacher: ['general', 'professeur', 'pro'],
};

export const PROFILE_LABELS: Record<UserProfile, string> = {
  college: 'Collégien·ne',
  lycee:   'Lycéen·ne',
  adulte:  'Adulte / Étudiant·e',
  teacher: 'Enseignant·e',
};
