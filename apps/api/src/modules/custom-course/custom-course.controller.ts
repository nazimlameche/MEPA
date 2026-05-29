import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
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
}
