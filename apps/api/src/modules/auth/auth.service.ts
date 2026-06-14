import {
  Injectable, UnauthorizedException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

const PARENTAL_CONSENT_AGE = 15; // CNIL: seuil légal français

export interface JwtPayload {
  sub:   string;
  role:  string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService:   JwtService,
    private readonly auditService: AuditService,
  ) {}

  // CNIL: calcul de l'âge à partir de birth_year uniquement
  private requiresParentalConsent(birthYear: number): boolean {
    return new Date().getFullYear() - birthYear < PARENTAL_CONSENT_AGE;
  }

  async register(dto: RegisterDto, ip?: string): Promise<{
    token:                   string;
    requiresParentalConsent: boolean;
    userId:                  string;
  }> {
    const user = await this.usersService.create({
      email:     dto.email,
      password:  dto.password,
      role:      dto.role,
      birthYear: dto.birthYear,
    });

    const needsParentalConsent = this.requiresParentalConsent(dto.birthYear);

    if (!needsParentalConsent) {
      await this.usersService.updateConsent(user.id, true);
    }

    // CNIL: audit de l'inscription
    await this.auditService.log({
      userId:   user.id,
      action:   'user.register',
      resource: 'users',
      ...(ip !== undefined ? { ip } : {}),
      metadata: { requiresParentalConsent: needsParentalConsent },
    });

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { token, requiresParentalConsent: needsParentalConsent, userId: user.id };
  }

  async login(dto: LoginDto, ip?: string): Promise<{ token: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé.');
    }

    // CNIL: bloquer l'accès si le consentement parental est requis mais non accordé
    if (this.requiresParentalConsent(user.birthYear) && !user.parentalConsent) {
      throw new ForbiddenException('Consentement parental requis');
    }

    // CNIL: audit de la connexion
    await this.auditService.log({
      userId:   user.id,
      action:   'user.login',
      resource: 'users',
      ...(ip !== undefined ? { ip } : {}),
      metadata: {},
    });

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }

  async submitParentalConsent(
    userId:      string,
    parentEmail: string,
    ip?:         string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId).catch(() => null);
    if (!user) throw new BadRequestException('Utilisateur introuvable.');

    if (!this.requiresParentalConsent(user.birthYear)) {
      throw new BadRequestException('Consentement parental non requis pour cet utilisateur.');
    }

    await this.usersService.updateParentalConsent(userId, parentEmail);

    // CNIL: audit du consentement parental — domaine uniquement, pas l'email complet
    await this.auditService.log({
      userId,
      action:   'user.parental_consent',
      resource: 'users',
      ...(ip !== undefined ? { ip } : {}),
      metadata: { parentEmailDomain: parentEmail.split('@')[1] },
    });

    return { message: 'Demande de consentement enregistrée.' };
  }
}
