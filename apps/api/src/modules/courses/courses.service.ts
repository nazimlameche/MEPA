import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  findByModule(moduleId: string): Promise<Course[]> {
    return this.repo.find({
      where: { moduleId, isPublished: true },
      order: { level: 'ASC', tier: 'ASC' },
    });
  }

  async findById(id: string): Promise<Course> {
    const course = await this.repo.findOneBy({ id });
    if (!course) throw new NotFoundException('Cours introuvable.');
    return course;
  }
}
