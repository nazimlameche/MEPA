import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Unique,
} from 'typeorm';
import { CustomCourseParcours } from './custom-course-parcours.entity';

@Entity('custom_course_chapters')
@Unique(['parcoursId', 'chapterIndex'])
export class CustomCourseChapter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parcours_id', type: 'uuid' })
  parcoursId!: string;

  @ManyToOne(() => CustomCourseParcours, parcours => parcours.chapters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcours_id' })
  parcours!: CustomCourseParcours;

  @Column({ name: 'chapter_index', type: 'smallint' })
  chapterIndex!: number;

  @Column({ name: 'chapter_key', type: 'varchar', length: 50 })
  chapterKey!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'generating' | 'ready' | 'error' | 'completed';

  @Column({ type: 'jsonb', nullable: true })
  content!: Record<string, unknown> | null;

  @Column({ name: 'xp_earned', type: 'smallint', default: 0 })
  xpEarned!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
