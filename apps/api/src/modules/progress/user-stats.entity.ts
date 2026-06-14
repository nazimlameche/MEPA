import {
  Entity, PrimaryGeneratedColumn, Column,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity('user_stats')
export class UserStats {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'integer', default: 0 })
  totalXp!: number;

  @Column({ type: 'integer', default: 1 })
  level!: number;

  @Column({ type: 'smallint', default: 0 })
  currentStreak!: number;

  @Column({ type: 'smallint', default: 0 })
  longestStreak!: number;

  @Column({ type: 'smallint', default: 0 })
  completedCourses!: number;

  @Column({ type: 'date', nullable: true })
  lastActivityDate!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
