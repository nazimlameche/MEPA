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

  // CNIL: stocké hashé — jamais en clair
  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', default: 'student' })
  role!: Role;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ageGroup!: UserAgeGroup | null;

  // CNIL: birth_year uniquement — pas de date exacte
  @Column({ type: 'int' })
  birthYear!: number;

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
