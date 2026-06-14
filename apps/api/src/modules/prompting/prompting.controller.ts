import {
  Controller, Post, Get, Body, UseGuards, Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PromptingService } from './prompting.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

interface AuthRequest extends ExpressRequest {
  user: { id: string; role: string };
}

@Controller('prompting')
@UseGuards(JwtAuthGuard)
export class PromptingController {
  constructor(private readonly promptingService: PromptingService) {}

  @Post('attempts')
  saveAttempt(
    @Request() req: AuthRequest,
    @Body() body: {
      exerciseId:  string;
      userPrompt:  string;
      totalScore:  number;
      passed:      boolean;
      scoreDetail: unknown;
    },
  ) {
    return this.promptingService.saveAttempt({
      userId:      req.user.id,
      exerciseId:  body.exerciseId,
      userPrompt:  body.userPrompt,
      totalScore:  body.totalScore,
      passed:      body.passed,
      scoreDetail: body.scoreDetail,
    });
  }

  @Get('attempts')
  getMyAttempts(@Request() req: AuthRequest) {
    return this.promptingService.getAttemptsByUser(req.user.id);
  }
}
