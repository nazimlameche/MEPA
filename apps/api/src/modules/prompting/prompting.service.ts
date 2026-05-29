import { Inject, Injectable } from '@nestjs/common';
import type { AIProvider, AIResponse } from '@ai-edu/shared';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';

const SYSTEM_PROMPT = `Tu es un évaluateur pédagogique de prompts pour des élèves apprenant le prompt engineering.
Compare le prompt de l'élève au résultat attendu, puis renvoie un retour structuré :
1. Une note sur 10 (clarté, précision, contexte fourni).
2. Trois points concrets à améliorer.
3. Une version améliorée du prompt.
Ne juge pas l'élève — sois encourageant et bienveillant.`;

@Injectable()
export class PromptingService {
  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
  ) {}

  // CNIL: aucune PII ne doit transiter dans userPrompt ni expectedOutput
  evaluatePrompt(userPrompt: string, expectedOutput: string): Promise<AIResponse> {
    const message = `Prompt de l'élève :\n${userPrompt}\n\nRésultat attendu :\n${expectedOutput}`;
    return this.aiProvider.chat(
      [{ role: 'user', content: message }],
      { systemPrompt: SYSTEM_PROMPT, temperature: 0.3 },
    );
  }
}
