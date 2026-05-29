import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query('moduleId') moduleId?: string, @Query('level') level?: string) {
    const filters: { moduleId?: string; level?: string } = {};
    if (moduleId !== undefined) filters.moduleId = moduleId;
    if (level !== undefined) filters.level = level;
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }
}
