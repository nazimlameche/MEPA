import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MistralService } from '../../shared/mistral/mistral.service';
import { RedisService } from '../../shared/redis/redis.service';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_MESSAGES = 10;

const SANDBOX_SYSTEM_PROMPT = `Tu es un assistant pédagogique qui aide les élèves à comprendre l'IA.
Réponds de façon claire, bienveillante et adaptée à des collégiens et lycéens.
Si une question sort du cadre éducatif sur l'IA, redirige poliment la conversation.`;

@Injectable()
export class SandboxService {
  constructor(
    private readonly mistral: MistralService,
    private readonly redis: RedisService,
  ) {}

  async sendMessage(userId: string, content: string): Promise<{ reply: string; moderated: boolean }> {
    await this.enforceRateLimit(userId);

    const isOffensive = await this.mistral.moderate(content);
    if (isOffensive) {
      return { reply: 'Ce message a été filtré car il ne respecte pas les règles de la plateforme.', moderated: true };
    }

    const reply = await this.mistral.chat(
      [{ role: 'user' as const, content }],
      SANDBOX_SYSTEM_PROMPT,
    );

    await this.persistMessage(userId, content, reply);

    return { reply, moderated: false };
  }

  private async enforceRateLimit(userId: string): Promise<void> {
    const key = `sandbox:rate:${userId}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
    if (count > RATE_LIMIT_MAX_MESSAGES) {
      // CNIL: rate-limit 10 messages/minute/utilisateur
      throw new HttpException('Limite de 10 messages par minute atteinte', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async persistMessage(userId: string, userMessage: string, aiReply: string): Promise<void> {
    const key = `sandbox:session:${userId}`;
    const existing = await this.redis.get(key);
    const messages: Array<{ role: string; content: string; ts: number }> = existing
      ? (JSON.parse(existing) as Array<{ role: string; content: string; ts: number }>)
      : [];

    messages.push(
      { role: 'user', content: userMessage, ts: Date.now() },
      { role: 'assistant', content: aiReply, ts: Date.now() },
    );

    const TTL_30_DAYS = 60 * 60 * 24 * 30;
    await this.redis.set(key, JSON.stringify(messages), TTL_30_DAYS);
  }
}
