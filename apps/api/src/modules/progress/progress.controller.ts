import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { ProgressService, type ProgressStatus } from './progress.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

class UpdateProgressDto {
  @IsIn(['in_progress', 'completed'])
  status!: ProgressStatus;
}

interface JwtRequest {
  user: { id: string };
}

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post(':courseId')
  update(@Request() req: JwtRequest, @Param('courseId') courseId: string, @Body() dto: UpdateProgressDto) {
    return this.progressService.upsertProgress(req.user.id, courseId, dto.status);
  }
}
