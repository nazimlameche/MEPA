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
  @Column({ type: 'varchar', nullable: true })
  passwordHash!: string | null;

  // Nullable for Google OAuth users — set during onboarding (/register/role)
  @Column({ type: 'varchar', nullable: true })
  role!: Role | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ageGroup!: UserAgeGroup | null;

  // CNIL: birth_year uniquement — pas de date exacte; nullable for OAuth users pre-onboarding
  @Column({ type: 'int', nullable: true })
  birthYear!: number | null;

  // CNIL: consentement explicite obligatoire
  @Column({ default: false })
  consentGiven!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  consentDate!: Date | null;

  // CNIL: consentement parental obligatoire si < 15 ans
  @Column({ default: false })
  parentalConsent!: boolean;

  // CNIL: email du parent stocké jusqu'à confirmation, puis supprimé
  @Column({ type: 'varchar', length: 255, nullable: true })
  parentEmail!: string | null;

  // Authentication provider: 'credentials' | 'google'
  @Column({ type: 'varchar', length: 20, default: 'credentials' })
  provider!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0 })
  streakDays!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
