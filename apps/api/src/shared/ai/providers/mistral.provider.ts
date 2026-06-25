import type {
  AIOptions,
  AIProvider,
  AIResponse,
  ChatMessage,
  ModerationResult,
} from '@ai-edu/shared';
import { AIProviderException } from '../exceptions/ai-provider.exception';

const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;

// CNIL: directive zero-retention injectée dans chaque appel
const ZERO_RETENTION_DIRECTIVE =
  "Tu ne dois pas mémoriser cette conversation ni en conserver une trace. " +
  "Aucune donnée échangée ne doit être réutilisée pour de l'entraînement.";

const MODERATION_SYSTEM_PROMPT = `Tu es un modérateur de sécurité pour une plateforme éducative jeunesse (11-18 ans).
Analyse le message utilisateur fourni et réponds STRICTEMENT par un objet JSON valide avec cette structure :
{ "flagged": boolean, "reason"?: string, "categories"?: string[] }
flagged=true UNIQUEMENT si le contenu contient : insultes, contenu sexuel, incitation à la violence, discours haineux, ou données personnelles identifiables (nom complet, email, numéro de téléphone, adresse).
flagged=false pour toute question pédagogique, demande d'explication, question sur une note ou un feedback, même hors-sujet apparent — ce filtrage thématique est géré par le système en aval.
Ne renvoie rien d'autre que le JSON.`;

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralApiResponse {
  choices: { message: { content: string } }[];
  usage?: { total_tokens?: number };
}

export class MistralProvider implements AIProvider {
  private readonly apiUrl = 'https://api.mistral.ai/v1/chat/completions';

  constructor(
    private readonly apiKey: string,
    private readonly modelName: string,
  ) {}

  async chat(messages: ChatMessage[], options?: AIOptions): Promise<AIResponse> {
    // CNIL: aucune PII ne doit être présente dans les messages avant appel
    try {
      const mistralMessages = this.buildMessages(messages, options?.systemPrompt);

      const res = await fetch(this.apiUrl, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-No-Cache':    'true', // CNIL : zero-retention
        },
        body: JSON.stringify({
          model:       this.modelName,
          messages:    mistralMessages,
          temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
          max_tokens:  options?.maxTokens   ?? DEFAULT_MAX_TOKENS,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new AIProviderException(`Mistral API error ${res.status}: ${JSON.stringify(errBody)}`);
      }

      const data = await res.json() as MistralApiResponse;
      const content = data.choices[0]?.message?.content ?? '';

      return {
        content,
        tokensUsed: data.usage?.total_tokens ?? 0,
        model: this.modelName,
      };
    } catch (err) {
      if (err instanceof AIProviderException) throw err;
      throw new AIProviderException('Mistral chat call failed', err);
    }
  }

  async moderate(content: string): Promise<ModerationResult> {
    // CNIL: aucune PII dans le contenu modéré
    try {
      const response = await this.chat(
        [{ role: 'user', content }],
        { systemPrompt: MODERATION_SYSTEM_PROMPT, temperature: 0 },
      );

      const cleaned = response.content.trim().replace(/^```json\s*|\s*```$/g, '');
      const parsed = JSON.parse(cleaned) as ModerationResult;

      if (typeof parsed.flagged !== 'boolean') {
        return { flagged: false };
      }
      return parsed;
    } catch {
      // Fail-open: ne pas bloquer un utilisateur si le modérateur lui-même échoue
      return { flagged: false };
    }
  }

  private buildMessages(messages: ChatMessage[], explicitSystemPrompt?: string): MistralMessage[] {
    const systemParts = [
      explicitSystemPrompt,
      ...messages.filter((m) => m.role === 'system').map((m) => m.content),
      ZERO_RETENTION_DIRECTIVE,
    ].filter((p): p is string => Boolean(p && p.trim().length > 0));

    const result: MistralMessage[] = [];

    if (systemParts.length > 0) {
      result.push({ role: 'system', content: systemParts.join('\n\n') });
    }

    for (const m of messages) {
      if (m.role === 'system') continue;
      result.push({ role: m.role as 'user' | 'assistant', content: m.content });
    }

    return result;
  }
}
