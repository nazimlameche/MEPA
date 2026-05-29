import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { XP_REWARDS, LEVEL_THRESHOLDS } from '@ai-edu/shared';

export type ProgressStatus = 'in_progress' | 'completed';

export interface UserProgressRow {
  id: string;
  userId: string;
  courseId: string;
  status: ProgressStatus;
  score: number;
  xpEarned: number;
  updatedAt: Date;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async upsertProgress(userId: string, courseId: string, status: ProgressStatus): Promise<UserProgressRow> {
    const result = await this.dataSource.query<UserProgressRow[]>(
      `INSERT INTO user_progress (user_id, course_id, status, xp_earned, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, course_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`,
      [userId, courseId, status, status === 'completed' ? XP_REWARDS.COURSE_COMPLETE : 0],
    );

    if (status === 'completed') {
      await this.usersRepo.increment({ id: userId }, 'xp', XP_REWARDS.COURSE_COMPLETE);
      await this.recalculateLevel(userId);
    }

    return result[0];
  }

  private async recalculateLevel(userId: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return;

    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (user.xp >= (LEVEL_THRESHOLDS[i] ?? 0)) {
        level = i + 1;
        break;
      }
    }

    await this.usersRepo.update(userId, { level });
  }
}
