import { GeminiProvider } from './gemini.provider';
import { AIProviderException } from '../exceptions/ai-provider.exception';

const generateContentMock = jest.fn<Promise<unknown>, [unknown]>();
const getGenerativeModelMock = jest.fn<{ generateContent: typeof generateContentMock }, [unknown]>(() => ({
  generateContent: generateContentMock,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: getGenerativeModelMock,
  })),
}));

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GeminiProvider('test-key', 'gemini-2.0-flash');
  });

  describe('chat', () => {
    it('returns an AIResponse with content, tokens, and model', async () => {
      generateContentMock.mockResolvedValueOnce({
        response: {
          text: () => 'Bonjour !',
          usageMetadata: { totalTokenCount: 42 },
        },
      });

      const result = await provider.chat(
        [{ role: 'user', content: 'Salut' }],
        { systemPrompt: 'Sois bref.' },
      );

      expect(result).toEqual({
        content: 'Bonjour !',
        tokensUsed: 42,
        model: 'gemini-2.0-flash',
      });
      expect(getGenerativeModelMock).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.0-flash',
          systemInstruction: expect.stringContaining('Sois bref.'),
        }),
      );
    });

    it('always injects the zero-retention directive into systemInstruction', async () => {
      generateContentMock.mockResolvedValueOnce({
        response: { text: () => 'ok', usageMetadata: { totalTokenCount: 1 } },
      });

      await provider.chat([{ role: 'user', content: 'hi' }]);

      const firstCall = getGenerativeModelMock.mock.calls[0];
      expect(firstCall).toBeDefined();
      const params = firstCall![0] as { systemInstruction: string };
      expect(params.systemInstruction).toMatch(/ne dois pas mémoriser/i);
    });

    it('maps assistant role to model and filters system messages out of contents', async () => {
      generateContentMock.mockResolvedValueOnce({
        response: { text: () => 'ok', usageMetadata: { totalTokenCount: 1 } },
      });

      await provider.chat([
        { role: 'system', content: 'instructions' },
        { role: 'user', content: 'Q' },
        { role: 'assistant', content: 'A' },
      ]);

      const firstCall = generateContentMock.mock.calls[0];
      expect(firstCall).toBeDefined();
      const req = firstCall![0] as { contents: Array<{ role: string }> };
      expect(req.contents.map((c) => c.role)).toEqual(['user', 'model']);
    });

    it('wraps SDK errors in AIProviderException', async () => {
      generateContentMock.mockRejectedValueOnce(new Error('network down'));

      await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
        AIProviderException,
      );
    });
  });

  describe('moderate', () => {
    it('parses a flagged JSON response', async () => {
      generateContentMock.mockResolvedValueOnce({
        response: {
          text: () => '{"flagged":true,"reason":"insulte"}',
          usageMetadata: { totalTokenCount: 5 },
        },
      });

      const result = await provider.moderate('mauvais message');

      expect(result).toEqual({ flagged: true, reason: 'insulte' });
    });

    it('returns flagged=false when the model returns malformed JSON (fail-open)', async () => {
      generateContentMock.mockResolvedValueOnce({
        response: { text: () => 'pas du json', usageMetadata: { totalTokenCount: 1 } },
      });

      const result = await provider.moderate('quelque chose');

      expect(result).toEqual({ flagged: false });
    });

    it('returns flagged=false when the provider throws (fail-open)', async () => {
      generateContentMock.mockRejectedValueOnce(new Error('boom'));

      const result = await provider.moderate('msg');

      expect(result).toEqual({ flagged: false });
    });
  });
});
