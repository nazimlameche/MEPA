import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AIProvider } from '@ai-edu/shared';
import { CustomCourseService } from './custom-course.service';
import { GeneratedCourseEntity } from './generated-course.entity';
import { AI_PROVIDER } from '../../shared/ai/ai-provider.token';
import { ProgressService } from '../progress/progress.service';

const mockRepo = {
  create:   jest.fn(),
  save:     jest.fn(),
  find:     jest.fn(),
  findOne:  jest.fn(),
};

const mockProgressService = {
  completeCourse: jest.fn().mockResolvedValue({ progress: {}, stats: {}, levelUp: false }),
};

describe('CustomCourseService', () => {
  let service: CustomCourseService;
  let aiProvider: jest.Mocked<AIProvider>;

  beforeEach(async () => {
    aiProvider = { chat: jest.fn(), moderate: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CustomCourseService,
        { provide: AI_PROVIDER,                              useValue: aiProvider },
        { provide: getRepositoryToken(GeneratedCourseEntity), useValue: mockRepo },
        { provide: ProgressService,                           useValue: mockProgressService },
      ],
    }).compile();

    service = moduleRef.get(CustomCourseService);
    jest.clearAllMocks();
  });

  it('parses a valid JSON response into a GeneratedCourse', async () => {
    const payload = {
      title: "Cours IA pour ados",
      sections: [{ heading: 'Intro', content: '...' }],
      exercises: [{ question: 'Quoi?', hint: 'pense' }],
    };
    aiProvider.chat.mockResolvedValueOnce({
      content: JSON.stringify(payload),
      tokensUsed: 100,
      model: 'mistral-small-latest',
    });

    const result = await service.generate('user-1', {
      interests: ['robotique', 'éthique'],
      level: 'beginner',
    });

    expect(result).toEqual(payload);
  });

  it('falls back to a single-section course when JSON parse fails', async () => {
    aiProvider.chat.mockResolvedValueOnce({
      content: 'pas du JSON',
      tokensUsed: 5,
      model: 'mistral-small-latest',
    });

    const result = await service.generate('user-1', {
      interests: ['robotique'],
      level: 'beginner',
    });

    expect(result.title).toBe("Cours sur l'IA");
    expect(result.sections).toEqual([{ heading: 'Introduction', content: 'pas du JSON' }]);
    expect(result.exercises).toEqual([]);
  });

  it('propagates provider errors', async () => {
    aiProvider.chat.mockRejectedValueOnce(new Error('provider down'));

    await expect(
      service.generate('user-1', { interests: ['x'], level: 'beginner' }),
    ).rejects.toThrow('provider down');
  });
});
