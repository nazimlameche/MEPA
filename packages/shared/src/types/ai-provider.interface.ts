export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
  categories?: string[];
}

export interface AIProvider {
  chat(messages: ChatMessage[], options?: AIOptions): Promise<AIResponse>;
  moderate(content: string): Promise<ModerationResult>;
}
