import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IsArray, IsString, ArrayMaxSize, IsIn } from 'class-validator';
import { CustomCourseService, type GeneratedCourse } from './custom-course.service';
import { JwtAuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

class GenerateDto {
  /** CNIL: interests must never contain name, email, or any PII */
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  interests!: string[];

  @IsIn(['beginner', 'intermediate', 'advanced'])
  level!: 'beginner' | 'intermediate' | 'advanced';
}

class SaveCourseDto {
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  interests!: string[];

  content!: unknown;
}

interface JwtRequest {
  user: { id: string };
}

@Controller('custom-course')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student', 'teacher')
export class CustomCourseController {
  constructor(private readonly customCourseService: CustomCourseService) {}

  @Post('generate')
  generate(@Request() req: JwtRequest, @Body() dto: GenerateDto): Promise<GeneratedCourse> {
    return this.customCourseService.generate(req.user.id, dto);
  }

  @Post('saved')
  saveCourse(@Request() req: JwtRequest, @Body() dto: SaveCourseDto) {
    return this.customCourseService.saveCourse(req.user.id, dto.interests, dto.content);
  }

  @Get('saved')
  getSavedCourses(@Request() req: JwtRequest) {
    return this.customCourseService.getSavedCourses(req.user.id);
  }

  @Get('saved/:id')
  getSavedCourse(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.getSavedCourse(req.user.id, id);
  }

  @Post('saved/:id/complete')
  completeSavedCourse(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.customCourseService.completeSavedCourse(req.user.id, id);
  }
}
