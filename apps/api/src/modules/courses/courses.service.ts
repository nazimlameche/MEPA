import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepo: Repository<CourseEntity>,
  ) {}

  findAll(filters: { moduleId?: string; level?: string }): Promise<CourseEntity[]> {
    const qb = this.coursesRepo.createQueryBuilder('course').where('course.isActive = :active', { active: true });

    if (filters.moduleId) qb.andWhere('course.moduleId = :moduleId', { moduleId: filters.moduleId });
    if (filters.level) qb.andWhere('course.level = :level', { level: filters.level });

    return qb.orderBy('course.createdAt', 'ASC').getMany();
  }

  async findById(id: string): Promise<CourseEntity> {
    const course = await this.coursesRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Cours introuvable');
    return course;
  }
}
