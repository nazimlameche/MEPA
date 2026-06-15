export const ROLES = ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre', 'admin'] as const;
export type Role = (typeof ROLES)[number];

// Rôles proposés à l'inscription — admin exclu de l'UI (usage interne uniquement)
export const SIGNUP_ROLES = ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];
