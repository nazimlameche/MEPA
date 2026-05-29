import { Module } from '@nestjs/common';
import { CustomCourseService } from './custom-course.service';
import { CustomCourseController } from './custom-course.controller';

@Module({
  providers: [CustomCourseService],
  controllers: [CustomCourseController],
})
export class CustomCourseModule {}
