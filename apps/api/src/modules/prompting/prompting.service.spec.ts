import { Test } from '@nestjs/testing';
import type { AIProvider, AIResponse } from '@ai-edu/shared';
import { PromptingService } from './prompting.service';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';

describe('PromptingService', () => {
  let service: PromptingService;
  let aiProvider: jest.Mocked<AIProvider>;

  beforeEach(async () => {
    aiProvider = {
      chat: jest.fn(),
      moderate: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PromptingService,
        { provide: AI_PROVIDER, useValue: aiProvider },
      ],
    }).compile();

    service = moduleRef.get(PromptingService);
  });

  it('forwards the prompt to the AI provider with the system prompt', async () => {
    const expected: AIResponse = { content: 'feedback', tokensUsed: 10, model: 'gemini-2.0-flash' };
    aiProvider.chat.mockResolvedValueOnce(expected);

    const result = await service.evaluatePrompt('mon prompt', 'résultat attendu');

    expect(result).toBe(expected);
    expect(aiProvider.chat).toHaveBeenCalledWith(
      [expect.objectContaining({ role: 'user' })],
      expect.objectContaining({ systemPrompt: expect.stringContaining('évaluateur') }),
    );
  });

  it('propagates provider errors', async () => {
    aiProvider.chat.mockRejectedValueOnce(new Error('provider down'));

    await expect(service.evaluatePrompt('a', 'b')).rejects.toThrow('provider down');
  });
});
