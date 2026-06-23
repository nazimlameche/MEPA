import type { Role } from './roles.js';
export interface User {
    id: string;
    /** CNIL: email is PII — never send to LLM, never log in plaintext */
    email: string;
    role: Role;
    /** CNIL: birthYear determines if parental consent flow is required (< 15) */
    birthYear: number;
    /** CNIL: must be true before allowing access to content */
    consentGiven: boolean;
    /** CNIL: required when birthYear < current_year - 15 */
    parentalConsent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile {
    id: string;
    role: Role;
    xp: number;
    level: number;
    streakDays: number;
    consentGiven: boolean;
    parentalConsent: boolean;
}
export interface ConsentInfo {
    /** CNIL: parental email is PII — stored only until consent is given, then deleted */
    parentEmail: string;
    consentGiven: boolean;
    consentDate?: Date;
}
export interface CreateUserDto {
    /** CNIL: PII — never log or send to external services */
    email: string;
    password: string;
    role: Role;
    /** CNIL: used to determine if parental consent flow is required */
    birthYear: number;
}
//# sourceMappingURL=user.types.d.ts.map