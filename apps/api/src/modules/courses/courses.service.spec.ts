import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

const mockRepo = {
  find:      jest.fn(),
  findOneBy: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CoursesService>(CoursesService);
    jest.clearAllMocks();
  });

  it('retourne les cours d\'un module', async () => {
    mockRepo.find.mockResolvedValue([]);
    const result = await service.findByModule('m1');
    expect(result).toEqual([]);
    expect(mockRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { moduleId: 'm1', isPublished: true } }),
    );
  });

  it('lève NotFoundException pour un id inconnu', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
  });
});
