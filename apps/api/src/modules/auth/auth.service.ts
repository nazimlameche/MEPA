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
  role:  string | null;
  email: string;
}

// CNIL: calcul de l'âge à partir de birth_year uniquement — null = âge inconnu (pas de consentement requis)
export function requiresParentalConsent(birthYear: number | null): boolean {
  if (birthYear === null) return false;
  return new Date().getFullYear() - birthYear < PARENTAL_CONSENT_AGE;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService:   JwtService,
    private readonly auditService: AuditService,
  ) {}

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

    const needsParentalConsent = requiresParentalConsent(dto.birthYear);

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

    if (!user.passwordHash) throw new UnauthorizedException('Ce compte utilise une connexion Google');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé.');
    }

    // CNIL: bloquer l'accès si le consentement parental est requis mais non accordé
    if (requiresParentalConsent(user.birthYear) && !user.parentalConsent) {
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

    if (!requiresParentalConsent(user.birthYear)) {
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

  /** Server-to-server endpoint: upsert a Google OAuth user and return API JWT */
  async oauthUpsert(email: string, provider: string, ip?: string): Promise<{
    token:              string;
    userId:             string;
    role:               string | null;
    needsRoleSelection: boolean;
  }> {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.createOAuthUser({ email, provider });

      // CNIL: audit de la création via OAuth
      await this.auditService.log({
        userId:   user.id,
        action:   'user.oauth_register',
        resource: 'users',
        ...(ip !== undefined ? { ip } : {}),
        metadata: { provider },
      });
    } else {
      // CNIL: audit de la connexion OAuth
      await this.auditService.log({
        userId:   user.id,
        action:   'user.oauth_login',
        resource: 'users',
        ...(ip !== undefined ? { ip } : {}),
        metadata: { provider },
      });
    }

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      userId:             user.id,
      role:               user.role,
      needsRoleSelection: user.role === null,
    };
  }
}
