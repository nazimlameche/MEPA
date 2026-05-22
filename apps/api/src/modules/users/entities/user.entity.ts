import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Role } from '@ai-edu/shared';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** CNIL: PII — never log or send to external services */
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', default: 'student' })
  role!: Role;

  /** CNIL: used to determine if parental consent is required (< 15 years old) */
  @Column({ type: 'int' })
  birthYear!: number;

  @Column({ default: false })
  consentGiven!: boolean;

  /** CNIL: required when birthYear < current_year - 15 */
  @Column({ default: false })
  parentalConsent!: boolean;

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
