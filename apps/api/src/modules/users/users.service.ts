import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import type { CreateUserDto } from '@ai-edu/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      birthYear: dto.birthYear,
    });

    return this.usersRepo.save(user);
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
    const { passwordHash: _pw, email: _email, ...profile } = user;
    return profile;
  }

  async updateConsent(id: string, parentalConsent: boolean): Promise<void> {
    await this.usersRepo.update(id, { parentalConsent });
  }

  async addXp(id: string, amount: number): Promise<void> {
    await this.usersRepo.increment({ id }, 'xp', amount);
  }

  /** CNIL: cascade delete all user data (droit à l'effacement) */
  async deleteWithCascade(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }

  async exportUserData(id: string): Promise<UserEntity> {
    return this.findById(id);
  }
}
