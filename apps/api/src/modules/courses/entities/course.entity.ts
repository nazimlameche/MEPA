import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  moduleId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'smallint' })
  level!: number;

  @Column({ type: 'smallint' })
  tier!: number;

  @Column({ type: 'jsonb', default: '[]' })
  contentBlocks!: unknown[];

  @Column({ type: 'smallint', default: 10 })
  xpReward!: number;

  @Column({ type: 'smallint', default: 5 })
  estimatedMinutes!: number;

  @Column({ type: 'boolean', default: false })
  isPublished!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
