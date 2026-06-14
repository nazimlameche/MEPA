import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomCourseService } from './custom-course.service';
import { CustomCourseController } from './custom-course.controller';
import { GeneratedCourseEntity } from './generated-course.entity';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedCourseEntity]), ProgressModule],
  providers: [CustomCourseService],
  controllers: [CustomCourseController],
})
export class CustomCourseModule {}
