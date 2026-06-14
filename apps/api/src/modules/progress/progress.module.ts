import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './user-progress.entity';
import { UserStats } from './user-stats.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports:     [TypeOrmModule.forFeature([UserProgress, UserStats])],
  providers:   [ProgressService],
  controllers: [ProgressController],
  exports:     [ProgressService],
})
export class ProgressModule {}
