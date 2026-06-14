import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('module/:moduleId')
  getByModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.findByModule(moduleId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }
}
