import { Module } from '@nestjs/common';
import { CustomCourseService } from './custom-course.service';
import { CustomCourseController } from './custom-course.controller';
import { MistralModule } from '../../shared/mistral/mistral.module';

@Module({
  imports: [MistralModule],
  providers: [CustomCourseService],
  controllers: [CustomCourseController],
})
export class CustomCourseModule {}
