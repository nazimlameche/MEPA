import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  exerciseId!: string;

  // CNIL: le prompt de l'utilisateur est une donnée personnelle potentielle
  // Il est stocké sans association avec le nom/email de l'utilisateur
  @Column({ type: 'text' })
  userPrompt!: string;

  @Column({ type: 'smallint' })
  totalScore!: number;

  @Column({ type: 'boolean' })
  passed!: boolean;

  @Column({ type: 'smallint', default: 0 })
  xpEarned!: number;

  @Column({ type: 'jsonb' })
  scoreDetail!: unknown;

  @CreateDateColumn({ type: 'timestamptz' })
  attemptedAt!: Date;
}
