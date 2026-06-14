import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from './quiz-attempt.entity';
import { PromptingService } from './prompting.service';
import { PromptingController } from './prompting.controller';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports:     [TypeOrmModule.forFeature([QuizAttempt]), ProgressModule],
  providers:   [PromptingService],
  controllers: [PromptingController],
  exports:     [PromptingService],
})
export class PromptingModule {}
