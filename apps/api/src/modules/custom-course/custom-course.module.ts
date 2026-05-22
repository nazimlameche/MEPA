import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomCourseService } from './custom-course.service';
import { CustomCourseController } from './custom-course.controller';
import { UserEntity } from '../users/entities/user.entity';
import { MistralModule } from '../../shared/mistral/mistral.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MistralModule],
  providers: [CustomCourseService],
  controllers: [CustomCourseController],
})
export class CustomCourseModule {}
