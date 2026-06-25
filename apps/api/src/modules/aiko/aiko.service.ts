import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type { AIProvider } from '@ai-edu/shared';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';
import { RedisService } from '../../shared/redis/redis.service';
import type { AikoChatMessage } from './dto/aiko-chat.dto';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_MESSAGES   = 20;

const AIKO_SYSTEM_PROMPT = `Tu es AIKO, un assistant pédagogique intégré à la plateforme AI-Edu.
Tu aides les élèves à comprendre le contenu du chapitre qu'ils sont en train d'étudier.
Réponds de façon claire, bienveillante et adaptée à des collégiens et lycéens (11-18 ans).

Règles absolues :
- Ne donne JAMAIS directement la réponse à un quiz ou un exercice — guide par des questions et des explications
- Reste uniquement sur le sujet du chapitre
- Si la question sort du cadre éducatif, redirige poliment
- Réponds toujours en français
- Sois concis (3-5 phrases maximum par réponse)`;

@Injectable()
export class AikoService {
  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    private readonly redis: RedisService,
  ) {}

  async chat(
    userId: string,
    messages: AikoChatMessage[],
    context: string,
  ): Promise<{ reply: string }> {
    // CNIL: rate-limit 20 messages/minute/utilisateur
    await this.enforceRateLimit(userId);

    const lastUserMessage = messages.at(-1);
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new HttpException('Dernier message invalide', HttpStatus.BAD_REQUEST);
    }

    // CNIL: modération du contenu utilisateur avant envoi à Mistral
    const moderation = await this.aiProvider.moderate(lastUserMessage.content);
    if (moderation.flagged) {
      return { reply: 'Ce message a été filtré car il ne respecte pas les règles de la plateforme.' };
    }

    // Système + contexte du chapitre injecté
    const systemPrompt = context.trim()
      ? `${AIKO_SYSTEM_PROMPT}\n\nContenu du chapitre actuellement étudié :\n${context}`
      : AIKO_SYSTEM_PROMPT;

    const response = await this.aiProvider.chat(messages, { systemPrompt });

    return { reply: response.content };
  }

  private async enforceRateLimit(userId: string): Promise<void> {
    const key   = `aiko:rate:${userId}`;
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    if (count > RATE_LIMIT_MAX_MESSAGES) {
      throw new HttpException('Limite de messages atteinte, réessaie dans une minute', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
