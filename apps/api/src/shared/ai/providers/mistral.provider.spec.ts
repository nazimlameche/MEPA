import { MistralProvider } from './mistral.provider';
import { AIProviderException } from '../exceptions/ai-provider.exception';

const mockFetch = jest.fn<Promise<Response>, [RequestInfo, RequestInit?]>();
global.fetch = mockFetch as typeof fetch;

function makeFetchResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('MistralProvider', () => {
  let provider: MistralProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new MistralProvider('test-key', 'mistral-small-latest');
  });

  describe('chat', () => {
    it('returns an AIResponse parsing choices[0].message.content', async () => {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({
          choices: [{ message: { content: 'Bonjour !' } }],
          usage: { total_tokens: 42 },
        }),
      );

      const result = await provider.chat(
        [{ role: 'user', content: 'Salut' }],
        { systemPrompt: 'Sois bref.' },
      );

      expect(result).toEqual({
        content: 'Bonjour !',
        tokensUsed: 42,
        model: 'mistral-small-latest',
      });
    });

    it('injects ZERO_RETENTION_DIRECTIVE into the system message', async () => {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({ choices: [{ message: { content: 'ok' } }], usage: { total_tokens: 1 } }),
      );

      await provider.chat([{ role: 'user', content: 'hi' }]);

      const body = JSON.parse((mockFetch.mock.calls[0]![1]?.body as string) ?? '{}') as {
        messages: { role: string; content: string }[];
      };
      const systemMsg = body.messages.find((m) => m.role === 'system');
      expect(systemMsg?.content).toMatch(/ne dois pas mémoriser/i);
    });

    it('filters system messages out of non-system turns and keeps role intact', async () => {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({ choices: [{ message: { content: 'ok' } }], usage: { total_tokens: 1 } }),
      );

      await provider.chat([
        { role: 'system', content: 'instructions' },
        { role: 'user', content: 'Q' },
        { role: 'assistant', content: 'A' },
      ]);

      const body = JSON.parse((mockFetch.mock.calls[0]![1]?.body as string) ?? '{}') as {
        messages: { role: string }[];
      };
      const nonSystem = body.messages.filter((m) => m.role !== 'system');
      expect(nonSystem.map((m) => m.role)).toEqual(['user', 'assistant']);
    });

    it('throws AIProviderException on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(makeFetchResponse({ error: 'bad key' }, false, 401));

      await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
        AIProviderException,
      );
    });

    it('wraps fetch errors in AIProviderException', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network down'));

      await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
        AIProviderException,
      );
    });
  });

  describe('moderate', () => {
    it('parses a flagged JSON response', async () => {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({
          choices: [{ message: { content: '{"flagged":true,"reason":"insulte"}' } }],
          usage: { total_tokens: 5 },
        }),
      );

      const result = await provider.moderate('mauvais message');

      expect(result).toEqual({ flagged: true, reason: 'insulte' });
    });

    it('returns flagged=false when the model returns malformed JSON (fail-open)', async () => {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({
          choices: [{ message: { content: 'pas du json' } }],
          usage: { total_tokens: 1 },
        }),
      );

      const result = await provider.moderate('quelque chose');

      expect(result).toEqual({ flagged: false });
    });

    it('returns flagged=false when fetch throws (fail-open)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('boom'));

      const result = await provider.moderate('msg');

      expect(result).toEqual({ flagged: false });
    });
  });
});
