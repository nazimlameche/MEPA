import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseTier = 'free' | 'premium';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  moduleId!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar' })
  level!: CourseLevel;

  @Column({ type: 'varchar', default: 'free' })
  tier!: CourseTier;

  @Column({ type: 'jsonb', default: '[]' })
  contentBlocks!: unknown[];

  @Column({ default: 50 })
  xpReward!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
