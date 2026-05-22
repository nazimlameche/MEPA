import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MistralChoice {
  message: { content: string };
}

interface MistralResponse {
  choices: MistralChoice[];
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);

  constructor(private readonly config: ConfigService) {}

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    const allMessages: ChatMessage[] = [];

    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }

    allMessages.push(...messages);

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.getOrThrow<string>('MISTRAL_API_KEY')}`,
        // CNIL: zero-retention — Mistral must not cache or store this request
        'X-No-Cache': 'true',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: allMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      this.logger.error(`Mistral API error: ${response.status}`);
      throw new InternalServerErrorException('Erreur lors de la communication avec le modèle IA');
    }

    const data = (await response.json()) as MistralResponse;
    return data.choices[0]?.message.content ?? '';
  }

  async moderate(text: string): Promise<boolean> {
    try {
      const result = await this.chat(
        [{ role: 'user', content: text }],
        `Tu es un modérateur de contenu. Réponds uniquement par "OUI" si ce message contient
du contenu offensant, inapproprié, ou hors-sujet pour une plateforme éducative jeunesse.
Réponds "NON" sinon.`,
      );
      return result.trim().toUpperCase().startsWith('OUI');
    } catch {
      return false;
    }
  }
}
