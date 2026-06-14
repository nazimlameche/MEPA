import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AIProvider } from '@ai-edu/shared';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';
import { GeneratedCourseEntity } from './generated-course.entity';
import { ProgressService } from '../progress/progress.service';
import { XP_CUSTOM_COURSE } from '../progress/xp.constants';

interface GenerateCourseDto {
  /** CNIL: interests must be anonymized — no name, email, or user identifier */
  interests: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedCourse {
  title: string;
  sections: Array<{ heading: string; content: string }>;
  exercises: Array<{ question: string; hint: string }>;
}

const SYSTEM_PROMPT = 'Tu es un expert pédagogique en IA. Génère des cours clairs et adaptés aux jeunes.';

@Injectable()
export class CustomCourseService {
  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    @InjectRepository(GeneratedCourseEntity)
    private readonly repo: Repository<GeneratedCourseEntity>,
    private readonly progressService: ProgressService,
  ) {}

  async generate(_userId: string, dto: GenerateCourseDto): Promise<GeneratedCourse> {
    // CNIL: interests anonymisés avant cet appel — on tronque par sécurité
    const sanitizedInterests = dto.interests.map((i) => i.trim().substring(0, 100));

    const prompt = `Crée un cours de niveau ${dto.level} sur l'IA et ses risques, adapté à des jeunes,
centré sur les thèmes suivants : ${sanitizedInterests.join(', ')}.
Réponds en JSON avec la structure : { title, sections: [{heading, content}], exercises: [{question, hint}] }`;

    const response = await this.aiProvider.chat(
      [{ role: 'user', content: prompt }],
      { systemPrompt: SYSTEM_PROMPT },
    );

    try {
      return JSON.parse(response.content) as GeneratedCourse;
    } catch {
      return {
        title: "Cours sur l'IA",
        sections: [{ heading: 'Introduction', content: response.content }],
        exercises: [],
      };
    }
  }

  async saveCourse(
    userId: string,
    interests: string[],
    content: unknown,
  ): Promise<GeneratedCourseEntity> {
    const entity = this.repo.create({ userId, interests, content });
    return this.repo.save(entity);
  }

  getSavedCourses(userId: string): Promise<GeneratedCourseEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getSavedCourse(userId: string, id: string): Promise<GeneratedCourseEntity> {
    const entity = await this.repo.findOne({ where: { id, userId } });
    if (!entity) throw new NotFoundException('Cours introuvable');
    return entity;
  }

  async completeSavedCourse(
    userId: string,
    id: string,
  ): Promise<{ levelUp: boolean }> {
    await this.getSavedCourse(userId, id); // ensures ownership
    const { levelUp } = await this.progressService.completeCourse(
      userId,
      `custom-${id}`,
      XP_CUSTOM_COURSE,
      100,
      { incrementCompleted: false },
    );
    return { levelUp };
  }
}
