import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Role } from '@ai-edu/shared';

export type UserAgeGroup = 'college' | 'lycee' | 'adulte' | 'teacher';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // CNIL: PII — never log or send to external services
  @Index({ unique: true })
  @Column({ unique: true })
  email!: string;

  // CNIL: stocké hashé — jamais en clair; nullable for OAuth users (no password)
  @Column({ type: 'varchar', nullable: true, name: 'password_hash' })
  passwordHash!: string | null;

  // Nullable for Google OAuth users — set during onboarding (/register/role)
  @Column({ type: 'varchar', nullable: true })
  role!: Role | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'age_group' })
  ageGroup!: UserAgeGroup | null;

  // CNIL: birth_year uniquement — pas de date exacte; nullable for OAuth users pre-onboarding
  @Column({ type: 'int', nullable: true, name: 'birth_year' })
  birthYear!: number | null;

  // CNIL: consentement explicite obligatoire
  @Column({ default: false, name: 'consent_given' })
  consentGiven!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'consent_date' })
  consentDate!: Date | null;

  // CNIL: consentement parental obligatoire si < 15 ans
  @Column({ default: false, name: 'parental_consent' })
  parentalConsent!: boolean;

  // CNIL: email du parent stocké jusqu'à confirmation, puis supprimé
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'parent_email' })
  parentEmail!: string | null;

  // Authentication provider: 'credentials' | 'google'
  @Column({ type: 'varchar', length: 20, default: 'credentials' })
  provider!: string;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0, name: 'streak_days' })
  streakDays!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_activity_at' })
  lastActivityAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
