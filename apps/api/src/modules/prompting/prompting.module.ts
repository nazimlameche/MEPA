import { Module } from '@nestjs/common';
import { PromptingService } from './prompting.service';
import { PromptingController } from './prompting.controller';

@Module({
  providers: [PromptingService],
  controllers: [PromptingController],
})
export class PromptingModule {}
