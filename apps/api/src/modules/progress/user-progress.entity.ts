import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index, Unique,
} from 'typeorm';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

@Entity('user_progress')
@Unique(['userId', 'courseId'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  courseId!: string;

  @Column({ type: 'varchar', length: 20, default: 'not_started' })
  status!: ProgressStatus;

  @Column({ type: 'smallint', default: 0 })
  score!: number;

  @Column({ type: 'smallint', default: 0 })
  xpEarned!: number;

  @Column({ type: 'smallint', default: 0 })
  currentBlock!: number;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'smallint', default: 0 })
  streakCount!: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastActivity!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
