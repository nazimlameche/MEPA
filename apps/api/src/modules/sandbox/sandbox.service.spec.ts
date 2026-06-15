import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import type { AIProvider } from '@ai-edu/shared';
import { SandboxService } from './sandbox.service';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';
import { RedisService } from '../../shared/redis/redis.service';
import { ProgressService } from '../progress/progress.service';

describe('SandboxService', () => {
  let service: SandboxService;
  let aiProvider: jest.Mocked<AIProvider>;
  const mockRedis = { incr: jest.fn(), expire: jest.fn(), get: jest.fn(), set: jest.fn() };
  const mockProgressService = {
    completeCourse: jest.fn().mockResolvedValue({ progress: {}, stats: {}, levelUp: false }),
  };

  beforeEach(async () => {
    aiProvider = { chat: jest.fn(), moderate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SandboxService,
        { provide: AI_PROVIDER,      useValue: aiProvider },
        { provide: RedisService,     useValue: mockRedis },
        { provide: ProgressService,  useValue: mockProgressService },
      ],
    }).compile();
    service = module.get<SandboxService>(SandboxService);
    jest.clearAllMocks();
  });

  it('throws when rate limit exceeded (HTTP 429)', async () => {
    mockRedis.incr.mockResolvedValue(11);
    mockRedis.expire.mockResolvedValue(1);

    await expect(service.sendMessage('user1', 'hello')).rejects.toBeInstanceOf(HttpException);
  });

  it('returns a moderated response when content is flagged', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    aiProvider.moderate.mockResolvedValue({ flagged: true, reason: 'insulte' });

    const result = await service.sendMessage('user1', 'offensive content');

    expect(result.moderated).toBe(true);
    expect(aiProvider.chat).not.toHaveBeenCalled();
  });

  it('returns the AI reply for a valid message and persists it', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockProgressService.completeCourse.mockResolvedValue({ progress: {}, stats: {}, levelUp: false });
    aiProvider.moderate.mockResolvedValue({ flagged: false });
    aiProvider.chat.mockResolvedValue({ content: 'Bonjour!', tokensUsed: 12, model: 'mistral-small-latest' });

    const result = await service.sendMessage('user1', 'Bonjour');

    expect(result).toEqual({ reply: 'Bonjour!', moderated: false });
    expect(mockRedis.set).toHaveBeenCalledWith(
      'sandbox:session:user1',
      expect.any(String),
      expect.any(Number),
    );
  });
});
