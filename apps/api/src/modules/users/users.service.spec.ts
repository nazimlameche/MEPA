import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { AuditService } from '../audit/audit.service';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  increment: jest.fn(),
  delete: jest.fn(),
};

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepo },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('throws ConflictException when email already exists', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1' });
      await expect(
        service.create({ email: 'a@b.com', password: 'pw', role: 'collegien', birthYear: 2005 }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a user successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ email: 'a@b.com' });
      mockRepo.save.mockResolvedValue({ id: '1', email: 'a@b.com' });
      const result = await service.create({ email: 'a@b.com', password: 'pw', role: 'lyceen', birthYear: 2005 });
      expect(result.id).toBe('1');
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
