import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { requiresParentalConsent } from '../auth/auth.service';
import type { CreateUserDto } from '@ai-edu/shared';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    // CNIL: mot de passe hashé — jamais stocké en clair
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email:        dto.email,
      passwordHash,
      role:         dto.role,
      birthYear:    dto.birthYear,
      provider:     'credentials',
      consentGiven: true,
      consentDate:  new Date(),
    });

    return this.usersRepo.save(user);
  }

  /** Creates a user via OAuth — no password, no role, no birthYear initially */
  async createOAuthUser(dto: { email: string; provider: string }): Promise<UserEntity> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) return existing;

    const user = this.usersRepo.create({
      email:        dto.email,
      passwordHash: null,
      role:         null,
      birthYear:    null,
      provider:     dto.provider,
      consentGiven: false,
    });

    return this.usersRepo.save(user);
  }

  /** Sets role + birthYear after Google onboarding; recalculates parental consent need */
  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<UserEntity> {
    const user = await this.findById(id);

    user.role      = dto.role;
    user.birthYear = dto.birthYear;

    const needsParental = requiresParentalConsent(dto.birthYear);
    if (!needsParental) {
      // CNIL: consentement automatique si >= 15 ans
      user.consentGiven = true;
      user.consentDate  = new Date();
    } else {
      user.consentGiven = false;
    }

    const saved = await this.usersRepo.save(user);

    await this.auditService.log({
      userId:   id,
      action:   'user.role_select',
      resource: 'users',
      metadata: { role: dto.role, requiresParentalConsent: needsParental },
    });

    return saved;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async getProfile(id: string): Promise<Omit<UserEntity, 'passwordHash' | 'email'>> {
    const user = await this.findById(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pw, email: _em, ...profile } = user;
    return profile;
  }

  async updateConsent(id: string, parentalConsent: boolean): Promise<void> {
    await this.usersRepo.update(id, { parentalConsent });
  }

  async updateParentalConsent(id: string, parentEmail: string): Promise<UserEntity> {
    const user = await this.findById(id);
    // CNIL: enregistrement du consentement parental
    user.parentalConsent = true;
    user.parentEmail     = parentEmail;
    return this.usersRepo.save(user);
  }

  async addXp(id: string, amount: number): Promise<void> {
    await this.usersRepo.increment({ id }, 'xp', amount);
  }

  // CNIL: droit à l'effacement — suppression cascade + audit obligatoire
  async deleteWithCascade(id: string, requesterId: string): Promise<void> {
    await this.usersRepo.delete(id);
    await this.auditService.log({
      userId:     requesterId,
      action:     'user.delete',
      resource:   'users',
      resourceId: id,
      metadata:   { reason: 'right_to_erasure' },
    });
  }

  // CNIL: droit d'accès — on n'expose pas le hash du mot de passe
  async exportUserData(id: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.findById(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeData } = user;
    return safeData;
  }
}
