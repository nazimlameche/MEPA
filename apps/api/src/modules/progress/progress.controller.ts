import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

interface AuthRequest extends ExpressRequest {
  user: { id: string; role: string };
}

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('stats')
  getStats(@Request() req: AuthRequest) {
    return this.progressService.getStats(req.user.id);
  }

  @Get('activity')
  getActivity(@Request() req: AuthRequest) {
    return this.progressService.getRecentActivity(req.user.id);
  }

  @Get('courses')
  getUserProgress(@Request() req: AuthRequest) {
    return this.progressService.getUserProgress(req.user.id);
  }

  @Get('courses/:courseId')
  getCourseProgress(
    @Request() req: AuthRequest,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(req.user.id, courseId);
  }

  @Post('courses/:courseId/start')
  startCourse(
    @Request() req: AuthRequest,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.startCourse(req.user.id, courseId);
  }

  @Post('courses/:courseId/position')
  savePosition(
    @Request() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Body() body: { currentBlock: number },
  ) {
    return this.progressService.savePosition(req.user.id, courseId, body.currentBlock);
  }

  @Post('courses/:courseId/complete')
  completeCourse(
    @Request() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Body() body: { xpReward: number; score: number },
  ) {
    return this.progressService.completeCourse(
      req.user.id,
      courseId,
      body.xpReward,
      body.score,
      { incrementCompleted: true },
    );
  }
}
