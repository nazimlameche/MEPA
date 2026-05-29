import { Inject, Injectable } from '@nestjs/common';
import type { AIProvider } from '@ai-edu/shared';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';

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
}
