import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomCourseService } from './custom-course.service';
import { CustomCourseController } from './custom-course.controller';
import { GeneratedCourseEntity } from './generated-course.entity';
import { CustomCourseParcours } from './entities/custom-course-parcours.entity';
import { CustomCourseChapter } from './entities/custom-course-chapter.entity';
import { ProgressModule } from '../progress/progress.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedCourseEntity, CustomCourseParcours, CustomCourseChapter]),
    ProgressModule,
    AuditModule,
  ],
  providers:   [CustomCourseService],
  controllers: [CustomCourseController],
})
export class CustomCourseModule {}
