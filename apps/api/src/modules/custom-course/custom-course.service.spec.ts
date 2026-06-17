import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CustomCourseService } from './custom-course.service';
import { GeneratedCourseEntity } from './generated-course.entity';
import { CustomCourseParcours } from './entities/custom-course-parcours.entity';
import { CustomCourseChapter } from './entities/custom-course-chapter.entity';
import { ProgressService } from '../progress/progress.service';
import { AuditService } from '../audit/audit.service';

const mockParcoursRepo = {
  create:   jest.fn(),
  save:     jest.fn(),
  find:     jest.fn(),
  findOne:  jest.fn(),
  delete:   jest.fn(),
};

const mockChapterRepo = {
  create:   jest.fn(),
  save:     jest.fn(),
  findOne:  jest.fn(),
};

const mockLegacyRepo = {
  create:   jest.fn(),
  save:     jest.fn(),
  find:     jest.fn(),
  findOne:  jest.fn(),
};

const mockProgressService = {
  completeCourse: jest.fn().mockResolvedValue({ progress: {}, stats: {}, levelUp: false }),
};

const mockAuditService = {
  log: jest.fn().mockResolvedValue(undefined),
};

describe('CustomCourseService', () => {
  let service: CustomCourseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CustomCourseService,
        { provide: getRepositoryToken(CustomCourseParcours), useValue: mockParcoursRepo },
        { provide: getRepositoryToken(CustomCourseChapter),  useValue: mockChapterRepo },
        { provide: getRepositoryToken(GeneratedCourseEntity), useValue: mockLegacyRepo },
        { provide: ProgressService,                           useValue: mockProgressService },
        { provide: AuditService,                              useValue: mockAuditService },
      ],
    }).compile();

    service = moduleRef.get(CustomCourseService);
    jest.clearAllMocks();
  });

  describe('createParcours', () => {
    it('crée 6 chapitres avec titres thématisés', async () => {
      const chapters = Array.from({ length: 6 }, (_, i) => ({ id: `ch-${i}` }));
      mockChapterRepo.create.mockImplementation((dto: { title: string }) => dto);
      const savedParcours = { id: 'p-1', theme: 'foot', level: 'college', chapters };
      mockParcoursRepo.create.mockReturnValue(savedParcours);
      mockParcoursRepo.save.mockResolvedValue(savedParcours);

      const result = await service.createParcours('u-1', { theme: 'foot', level: 'college' });

      expect(mockChapterRepo.create).toHaveBeenCalledTimes(6);
      // Premier chapitre thématisé
      expect(mockChapterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Comprendre l'IA — foot", chapterIndex: 0 }),
      );
      // Dernier chapitre thématisé
      expect(mockChapterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Éthique & usages — foot', chapterIndex: 5 }),
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u-1', action: 'create_parcours' }),
      );
      expect(result).toBe(savedParcours);
    });
  });

  describe('saveChapterContent', () => {
    it('met à jour status + content et vérifie ownership', async () => {
      const chapter = {
        id: 'ch-1', status: 'pending', content: null,
        parcours: { userId: 'u-1' },
      };
      mockChapterRepo.findOne.mockResolvedValue(chapter);
      mockChapterRepo.save.mockImplementation((c: typeof chapter) => Promise.resolve(c));

      const result = await service.saveChapterContent('ch-1', 'u-1', {
        status:  'ready',
        content: { title: 'Test', blocks: [] },
      });

      expect(result.status).toBe('ready');
      expect(result.content).toEqual({ title: 'Test', blocks: [] });
    });

    it('lève NotFoundException si userId ne correspond pas', async () => {
      mockChapterRepo.findOne.mockResolvedValue({
        id: 'ch-1', parcours: { userId: 'autre-user' },
      });

      await expect(
        service.saveChapterContent('ch-1', 'u-1', { status: 'ready', content: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeChapter', () => {
    it('est idempotent si déjà complété', async () => {
      mockChapterRepo.findOne.mockResolvedValue({
        id: 'ch-1', completedAt: new Date(), xpEarned: 20,
        parcours: { userId: 'u-1' },
      });

      const result = await service.completeChapter('ch-1', 'u-1');

      expect(result).toEqual({ xpEarned: 20 });
      expect(mockProgressService.completeCourse).not.toHaveBeenCalled();
    });

    it('appelle progressService.completeCourse avec le bon XP', async () => {
      mockChapterRepo.findOne.mockResolvedValue({
        id: 'ch-1', chapterIndex: 2, completedAt: null, xpEarned: 0,
        parcours: { userId: 'u-1' },
      });
      mockChapterRepo.save.mockImplementation((c: unknown) => Promise.resolve(c));

      const result = await service.completeChapter('ch-1', 'u-1');

      expect(result.xpEarned).toBe(25); // atelier-prompting = 25 XP
      expect(mockProgressService.completeCourse).toHaveBeenCalledWith(
        'u-1', 'custom-ch-1', 25, 100, { incrementCompleted: false },
      );
    });
  });
});
