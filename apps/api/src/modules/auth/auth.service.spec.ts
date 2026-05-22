import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  updateConsent: jest.fn(),
};
const mockJwtService = { signAsync: jest.fn().mockResolvedValue('test-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when parental consent missing for under-15', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: await bcrypt.hash('pw', 10),
        role: 'student',
        email: 'a@b.com',
        birthYear: new Date().getFullYear() - 10,
        parentalConsent: false,
      });
      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toThrow(ForbiddenException);
    });

    it('returns access token for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'student',
        email: 'a@b.com',
        birthYear: 2000,
        parentalConsent: true,
      });
      const result = await service.login({ email: 'a@b.com', password: 'password123' });
      expect(result.accessToken).toBe('test-token');
    });
  });
});
