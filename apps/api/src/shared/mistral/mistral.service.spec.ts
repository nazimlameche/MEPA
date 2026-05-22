import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MistralService } from './mistral.service';

const mockConfig = { getOrThrow: jest.fn().mockReturnValue('test-api-key') };

describe('MistralService', () => {
  let service: MistralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MistralService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<MistralService>(MistralService);
  });

  it('sends X-No-Cache header (CNIL zero-retention)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
    } as Response);

    await service.chat([{ role: 'user', content: 'hello' }]);

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['X-No-Cache']).toBe('true');

    fetchSpy.mockRestore();
  });

  it('moderate returns false when API call fails', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    const result = await service.moderate('some text');
    expect(result).toBe(false);
  });
});
