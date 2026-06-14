import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('generated_courses')
export class GeneratedCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  // CNIL: interests are already anonymized before storage (anonymizeInterest applied in Next route)
  @Column({ type: 'jsonb' })
  interests!: string[];

  @Column({ type: 'jsonb' })
  content!: unknown;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
