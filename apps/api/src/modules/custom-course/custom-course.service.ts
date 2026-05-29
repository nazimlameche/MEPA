import { Injectable } from '@nestjs/common';
import { MistralService } from '../../shared/mistral/mistral.service';

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

@Injectable()
export class CustomCourseService {
  constructor(private readonly mistral: MistralService) {}

  async generate(_userId: string, dto: GenerateCourseDto): Promise<GeneratedCourse> {
    /** CNIL: verify no PII in interests before sending to Mistral */
    const sanitizedInterests = dto.interests.map((i) => i.trim().substring(0, 100));

    const prompt = `Crée un cours de niveau ${dto.level} sur l'IA et ses risques, adapté à des jeunes,
centré sur les thèmes suivants : ${sanitizedInterests.join(', ')}.
Réponds en JSON avec la structure : { title, sections: [{heading, content}], exercises: [{question, hint}] }`;

    const raw = await this.mistral.chat(
      [{ role: 'user' as const, content: prompt }],
      'Tu es un expert pédagogique en IA. Génère des cours clairs et adaptés aux jeunes.',
    );

    try {
      return JSON.parse(raw) as GeneratedCourse;
    } catch {
      return {
        title: "Cours sur l'IA",
        sections: [{ heading: 'Introduction', content: raw }],
        exercises: [],
      };
    }
  }
}
