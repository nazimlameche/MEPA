import {
  Controller, Post, Get, Put, Delete, Body, Param,
  UseGuards, Request,
} from '@nestjs/common';
import { CustomCourseService } from './custom-course.service';
import { CreateParcoursDto } from './dto/create-parcours.dto';
import { SaveChapterContentDto } from './dto/save-chapter-content.dto';
import { JwtAuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

interface JwtRequest {
  user: { id: string };
}

@Controller('custom-course')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('collegien', 'lyceen', 'enseignant', 'professionnel', 'autre')
export class CustomCourseController {
  constructor(private readonly customCourseService: CustomCourseService) {}

  @Post('parcours')
  createParcours(@Request() req: JwtRequest, @Body() dto: CreateParcoursDto) {
    return this.customCourseService.createParcours(req.user.id, dto);
  }

  @Get('parcours')
  getUserParcours(@Request() req: JwtRequest) {
    return this.customCourseService.getUserParcours(req.user.id);
  }

  @Get('parcours/:id')
  getParcours(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.getParcours(id, req.user.id);
  }

  @Delete('parcours/:id')
  deleteParcours(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.deleteParcours(id, req.user.id);
  }

  @Get('chapters/:id')
  getChapter(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.getChapter(id, req.user.id);
  }

  @Put('chapters/:id/content')
  saveChapterContent(
    @Request() req: JwtRequest,
    @Param('id') id: string,
    @Body() dto: SaveChapterContentDto,
  ) {
    return this.customCourseService.saveChapterContent(id, req.user.id, dto);
  }

  @Post('chapters/:id/complete')
  completeChapter(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.completeChapter(id, req.user.id);
  }
}
