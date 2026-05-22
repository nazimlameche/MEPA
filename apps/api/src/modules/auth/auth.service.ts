import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

const PARENTAL_CONSENT_AGE = 15;

export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ requiresParentalConsent: boolean }> {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      birthYear: dto.birthYear,
    });

    /** CNIL: block access until parental consent if age < 15 */
    const age = new Date().getFullYear() - dto.birthYear;
    const requiresParentalConsent = age < PARENTAL_CONSENT_AGE;

    if (requiresParentalConsent) {
      return { requiresParentalConsent: true };
    }

    await this.usersService.updateConsent(user.id, true);
    return { requiresParentalConsent: false };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; requiresParentalConsent: boolean }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    /** CNIL: block access if parental consent required but not yet given */
    const age = new Date().getFullYear() - user.birthYear;
    if (age < PARENTAL_CONSENT_AGE && !user.parentalConsent) {
      throw new ForbiddenException('Consentement parental requis');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, requiresParentalConsent: false };
  }
}
