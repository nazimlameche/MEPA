import { Test, TestingModule } from '@nestjs/testing';
import { TooManyRequestsException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SandboxService } from './sandbox.service';
import { UserEntity } from '../users/entities/user.entity';
import { MistralService } from '../../shared/mistral/mistral.service';
import { RedisService } from '../../shared/redis/redis.service';

const mockUsersRepo = {};
const mockMistral = { chat: jest.fn(), moderate: jest.fn() };
const mockRedis = { incr: jest.fn(), expire: jest.fn(), get: jest.fn(), set: jest.fn() };
const mockConfig = { get: jest.fn() };

describe('SandboxService', () => {
  let service: SandboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SandboxService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUsersRepo },
        { provide: MistralService, useValue: mockMistral },
        { provide: RedisService, useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<SandboxService>(SandboxService);
    jest.clearAllMocks();
  });

  it('throws TooManyRequestsException when rate limit exceeded', async () => {
    mockRedis.incr.mockResolvedValue(11);
    mockRedis.expire.mockResolvedValue(1);
    await expect(service.sendMessage('user1', 'hello')).rejects.toThrow(TooManyRequestsException);
  });

  it('returns moderated response for offensive content', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockMistral.moderate.mockResolvedValue(true);
    const result = await service.sendMessage('user1', 'offensive content');
    expect(result.moderated).toBe(true);
  });

  it('returns AI reply for valid message', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockMistral.moderate.mockResolvedValue(false);
    mockMistral.chat.mockResolvedValue('Bonjour!');
    const result = await service.sendMessage('user1', 'Bonjour');
    expect(result.reply).toBe('Bonjour!');
    expect(result.moderated).toBe(false);
  });
});
