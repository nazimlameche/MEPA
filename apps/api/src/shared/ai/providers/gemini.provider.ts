import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
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

const ZERO_RETENTION_DIRECTIVE =
  "Tu ne dois pas mémoriser cette conversation ni en conserver une trace. " +
  "Aucune donnée échangée ne doit être réutilisée pour de l'entraînement.";

// CNIL: TODO production — l'opt-out via systemInstruction est best-effort.
// Pour une zero-retention contractuelle, migrer vers Vertex AI (@google-cloud/vertexai)
// ou utiliser une clé Google AI Studio avec data-collection désactivée dans la console.

const MODERATION_SYSTEM_PROMPT = `Tu es un modérateur de contenu pour une plateforme éducative jeunesse.
Analyse le message utilisateur fourni et réponds STRICTEMENT par un objet JSON valide avec cette structure :
{ "flagged": boolean, "reason"?: string, "categories"?: string[] }
flagged=true si le contenu est offensant, inapproprié, ou hors-sujet pédagogique sur l'IA.
Ne renvoie rien d'autre que le JSON.`;

export class GeminiProvider implements AIProvider {
  private readonly client: GoogleGenerativeAI;

  constructor(
    apiKey: string,
    private readonly modelName: string,
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(messages: ChatMessage[], options?: AIOptions): Promise<AIResponse> {
    // CNIL: aucune PII ne doit être présente dans les messages avant appel
    try {
      const systemInstruction = this.buildSystemInstruction(messages, options?.systemPrompt);
      const contents = this.toGeminiContents(messages);

      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
          temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
        },
      });

      const result = await model.generateContent({ contents });

      return {
        content: result.response.text(),
        tokensUsed: result.response.usageMetadata?.totalTokenCount ?? 0,
        model: this.modelName,
      };
    } catch (err) {
      throw new AIProviderException('Gemini chat call failed', err);
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

  private buildSystemInstruction(
    messages: ChatMessage[],
    explicitSystemPrompt?: string,
  ): string {
    const systemFromMessages = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const parts = [explicitSystemPrompt, systemFromMessages, ZERO_RETENTION_DIRECTIVE]
      .filter((p): p is string => Boolean(p && p.trim().length > 0));

    return parts.join('\n\n');
  }

  private toGeminiContents(messages: ChatMessage[]): Content[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }
}
