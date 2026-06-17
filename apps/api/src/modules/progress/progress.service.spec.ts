import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { UserProgress } from './user-progress.entity';
import { UserStats } from './user-stats.entity';

const mockProgressRepo = {
  findOneBy: jest.fn(),
  findBy:    jest.fn(),
  find:      jest.fn(),
  create:    jest.fn(),
  save:      jest.fn(),
};

const mockStatsRepo = {
  findOneBy: jest.fn(),
  create:    jest.fn(),
  save:      jest.fn(),
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: getRepositoryToken(UserProgress), useValue: mockProgressRepo },
        { provide: getRepositoryToken(UserStats),    useValue: mockStatsRepo },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    jest.clearAllMocks();
  });

  describe('getRecentActivity', () => {
    it('retourne [] quand aucune progression complétée', async () => {
      mockProgressRepo.find.mockResolvedValue([]);
      const result = await service.getRecentActivity('u1');
      expect(result).toEqual([]);
    });

    it('mappe correctement les 3 types via préfixe de courseId', async () => {
      const now = new Date();
      mockProgressRepo.find.mockResolvedValue([
        { id: '1', courseId: 'intro-ia',          xpEarned: 50, completedAt: now, status: 'completed' },
        { id: '2', courseId: 'prompting-ex1',     xpEarned: 25, completedAt: now, status: 'completed' },
        { id: '3', courseId: 'custom-abc',        xpEarned: 30, completedAt: now, status: 'completed' },
      ]);
      const result = await service.getRecentActivity('u1');
      expect(result[0]!.type).toBe('course_completed');
      expect(result[1]!.type).toBe('prompt_scored');
      expect(result[2]!.type).toBe('course_generated');
    });

    it('respecte la limite et demande l\'ordre DESC', async () => {
      mockProgressRepo.find.mockResolvedValue([]);
      await service.getRecentActivity('u1', 5);
      expect(mockProgressRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { completedAt: 'DESC' },
          take:  5,
        }),
      );
    });
  });

  describe('completeCourse', () => {
    it('ajoute les XP et incrémente le compteur de cours', async () => {
      const mockProgress = {
        userId: 'u1', courseId: 'c1', status: 'in_progress',
        score: 0, xpEarned: 0, completedAt: null, streakCount: 0,
      };
      const mockStats = {
        userId: 'u1', totalXp: 100, level: 1,
        currentStreak: 0, longestStreak: 0,
        completedCourses: 0, lastActivityDate: null,
      };

      mockProgressRepo.findOneBy.mockResolvedValue(mockProgress);
      mockProgressRepo.save.mockResolvedValue({ ...mockProgress, status: 'completed', xpEarned: 15 });
      mockStatsRepo.findOneBy.mockResolvedValue(mockStats);
      mockStatsRepo.save.mockResolvedValue({ ...mockStats, totalXp: 115, completedCourses: 1 });

      const result = await service.completeCourse('u1', 'c1', 15, 100);

      expect(result.progress.status).toBe('completed');
      expect(mockStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ totalXp: 115, completedCourses: 1 }),
      );
    });

    it('détecte un level up quand les XP franchissent le seuil', async () => {
      const mockProgress = {
        userId: 'u1', courseId: 'c1', status: 'in_progress',
        score: 0, xpEarned: 0, completedAt: null, streakCount: 0,
      };
      // 490 XP + 15 → 505 → level 2
      const mockStats = {
        userId: 'u1', totalXp: 490, level: 1,
        currentStreak: 1, longestStreak: 1,
        completedCourses: 3, lastActivityDate: null,
      };

      mockProgressRepo.findOneBy.mockResolvedValue(mockProgress);
      mockProgressRepo.save.mockResolvedValue({ ...mockProgress, status: 'completed' });
      mockStatsRepo.findOneBy.mockResolvedValue(mockStats);
      mockStatsRepo.save.mockResolvedValue({ ...mockStats, totalXp: 505, level: 2 });

      const result = await service.completeCourse('u1', 'c1', 15, 100);

      expect(result.levelUp).toBe(true);
    });

    it('maintient le streak si actif hier', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const mockProgress = {
        userId: 'u1', courseId: 'c1', status: 'in_progress',
        score: 0, xpEarned: 0, completedAt: null, streakCount: 0,
      };
      const mockStats = {
        userId: 'u1', totalXp: 100, level: 1,
        currentStreak: 3, longestStreak: 5,
        completedCourses: 2, lastActivityDate: yesterday,
      };

      mockProgressRepo.findOneBy.mockResolvedValue(mockProgress);
      mockProgressRepo.save.mockResolvedValue({ ...mockProgress, status: 'completed' });
      mockStatsRepo.findOneBy.mockResolvedValue(mockStats);
      mockStatsRepo.save.mockImplementation((s) => Promise.resolve(s));

      await service.completeCourse('u1', 'c1', 10, 100);

      expect(mockStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ currentStreak: 4 }),
      );
    });
  });
});
