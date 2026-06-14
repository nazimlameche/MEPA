import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  create:                jest.fn(),
  findByEmail:           jest.fn(),
  findById:              jest.fn(),
  updateConsent:         jest.fn(),
  updateParentalConsent: jest.fn(),
};
const mockJwtService   = { signAsync: jest.fn().mockResolvedValue('test-token') };
const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService,  useValue: mockUsersService },
        { provide: JwtService,    useValue: mockJwtService },
        { provide: AuditService,  useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('crée un compte et retourne un token', async () => {
      mockUsersService.create.mockResolvedValue({
        id: 'user-1', email: 'test@example.com', role: 'student', birthYear: 2000,
        isActive: true, parentalConsent: true,
      });

      const result = await service.register({
        email: 'test@example.com', password: 'password123', role: 'student', birthYear: 2000,
      });

      expect(result.token).toBe('test-token');
      expect(result.requiresParentalConsent).toBe(false);
    });

    it('détecte le besoin de consentement parental pour un mineur < 15 ans', async () => {
      const youngBirthYear = new Date().getFullYear() - 12;
      mockUsersService.create.mockResolvedValue({
        id: 'user-2', email: 'jeune@example.com', role: 'student', birthYear: youngBirthYear,
        isActive: true, parentalConsent: false,
      });

      const result = await service.register({
        email: 'jeune@example.com', password: 'password123', role: 'student', birthYear: youngBirthYear,
      });

      expect(result.requiresParentalConsent).toBe(true);
      expect(mockUsersService.updateConsent).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('lève UnauthorizedException pour un email inconnu', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });

    it('lève ForbiddenException quand le consentement parental manque (< 15 ans)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: await bcrypt.hash('pw', 10),
        role: 'student', email: 'a@b.com',
        birthYear: new Date().getFullYear() - 10,
        parentalConsent: false,
        isActive: true,
      });
      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(ForbiddenException);
    });

    it('retourne un token avec des credentials valides', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'student', email: 'a@b.com',
        birthYear: 2000,
        parentalConsent: true,
        isActive: true,
      });

      const result = await service.login({ email: 'a@b.com', password: 'password123' });
      expect(result.token).toBe('test-token');
    });

    it('lève UnauthorizedException si le compte est inactif', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'student', email: 'a@b.com',
        birthYear: 2000, parentalConsent: true,
        isActive: false,
      });
      await expect(service.login({ email: 'a@b.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
