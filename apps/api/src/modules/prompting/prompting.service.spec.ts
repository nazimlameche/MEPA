import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PromptingService } from './prompting.service';
import { QuizAttempt } from './quiz-attempt.entity';
import { ProgressService } from '../progress/progress.service';

const mockRepo = {
  create:  jest.fn(),
  save:    jest.fn(),
  find:    jest.fn(),
  findOne: jest.fn(),
};

const mockProgressService = {
  completeCourse: jest.fn().mockResolvedValue({ progress: {}, stats: {}, levelUp: false }),
};

describe('PromptingService', () => {
  let service: PromptingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptingService,
        { provide: getRepositoryToken(QuizAttempt), useValue: mockRepo },
        { provide: ProgressService,                 useValue: mockProgressService },
      ],
    }).compile();

    service = module.get<PromptingService>(PromptingService);
    jest.clearAllMocks();
  });

  describe('saveAttempt', () => {
    it('accorde XP_PERFECT_SCORE (25) et déclenche completeCourse pour un score parfait', async () => {
      const attempt = { id: '1', userId: 'u1', exerciseId: 'ex1', totalScore: 100, passed: true, xpEarned: 25 };
      mockRepo.create.mockReturnValue(attempt);
      mockRepo.save.mockResolvedValue(attempt);

      const result = await service.saveAttempt({
        userId: 'u1', exerciseId: 'ex1', userPrompt: 'mon prompt',
        totalScore: 100, passed: true, scoreDetail: {},
      });

      expect(result.xpEarned).toBe(25);
      expect(mockProgressService.completeCourse).toHaveBeenCalledWith(
        'u1', 'prompting-ex1', 25, 100,
      );
    });

    it('accorde XP_PARTIAL_SCORE (10) et ne déclenche pas completeCourse pour un score partiel', async () => {
      const attempt = { id: '2', userId: 'u1', exerciseId: 'ex1', totalScore: 70, passed: false, xpEarned: 10 };
      mockRepo.create.mockReturnValue(attempt);
      mockRepo.save.mockResolvedValue(attempt);

      const result = await service.saveAttempt({
        userId: 'u1', exerciseId: 'ex1', userPrompt: 'mon prompt',
        totalScore: 70, passed: false, scoreDetail: {},
      });

      expect(result.xpEarned).toBe(10);
      expect(mockProgressService.completeCourse).not.toHaveBeenCalled();
    });
  });
});
