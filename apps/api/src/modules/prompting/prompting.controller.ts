import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AIResponse } from '@ai-edu/shared';
import { PromptingService } from './prompting.service';
import { EvaluatePromptDto } from './dto/evaluate-prompt.dto';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

@Controller('prompting')
@UseGuards(JwtAuthGuard)
export class PromptingController {
  constructor(private readonly promptingService: PromptingService) {}

  @Post('evaluate')
  evaluate(@Body() dto: EvaluatePromptDto): Promise<AIResponse> {
    return this.promptingService.evaluatePrompt(dto.userPrompt, dto.expectedOutput);
  }
}
