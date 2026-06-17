import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  OneToMany, JoinColumn, CreateDateColumn, Index,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CustomCourseChapter } from './custom-course-chapter.entity';

@Entity('custom_course_parcours')
export class CustomCourseParcours {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  theme!: string;

  @Column({ type: 'varchar', length: 20 })
  level!: 'college' | 'lycee' | 'adulte';

  @OneToMany(() => CustomCourseChapter, chapter => chapter.parcours, {
    cascade: true,
    eager:   true,
  })
  chapters!: CustomCourseChapter[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
