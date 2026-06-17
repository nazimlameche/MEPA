import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './user-progress.entity';
import { UserStats } from './user-stats.entity';

const XP_PER_LEVEL = 500;

export type ActivityType = 'course_completed' | 'prompt_scored' | 'course_generated';

export interface ActivityItemDto {
  id: string;
  type: ActivityType;
  courseId: string;
  xpEarned: number;
  timestamp: Date;
}

function deriveActivityType(courseId: string): ActivityType {
  if (courseId.startsWith('prompting-')) return 'prompt_scored';
  if (courseId.startsWith('custom-'))    return 'course_generated';
  return 'course_completed';
}

function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]!;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepo: Repository<UserProgress>,
    @InjectRepository(UserStats)
    private readonly statsRepo: Repository<UserStats>,
  ) {}

  async getStats(userId: string): Promise<UserStats> {
    let stats = await this.statsRepo.findOneBy({ userId });
    if (!stats) {
      stats = this.statsRepo.create({ userId });
      await this.statsRepo.save(stats);
    }
    return stats;
  }

  getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.progressRepo.findBy({ userId });
  }

  getCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    return this.progressRepo.findOneBy({ userId, courseId });
  }

  async startCourse(userId: string, courseId: string): Promise<UserProgress> {
    const existing = await this.getCourseProgress(userId, courseId);
    if (existing) return existing;

    const progress = this.progressRepo.create({ userId, courseId, status: 'in_progress' });
    return this.progressRepo.save(progress);
  }

  async savePosition(userId: string, courseId: string, currentBlock: number): Promise<void> {
    let progress = await this.getCourseProgress(userId, courseId);
    if (!progress) {
      progress = this.progressRepo.create({ userId, courseId, status: 'in_progress', currentBlock });
    } else {
      progress.status       = progress.status === 'completed' ? 'completed' : 'in_progress';
      progress.currentBlock = currentBlock;
    }
    await this.progressRepo.save(progress);
  }

  // CNIL: dérivé de user_progress uniquement — jamais de quiz_attempts.userPrompt (PII)
  async getRecentActivity(userId: string, limit = 10): Promise<ActivityItemDto[]> {
    const rows = await this.progressRepo.find({
      where: { userId, status: 'completed' },
      order: { completedAt: 'DESC' },
      take:  limit,
    });
    return rows.map(r => ({
      id:        r.id,
      type:      deriveActivityType(r.courseId),
      courseId:  r.courseId,
      xpEarned:  r.xpEarned,
      timestamp: r.completedAt!,
    }));
  }

  async completeCourse(
    userId: string,
    courseId: string,
    xpReward: number,
    score: number,
    opts: { incrementCompleted?: boolean } = {},
  ): Promise<{ progress: UserProgress; stats: UserStats; levelUp: boolean }> {
    const incrementCompleted = opts.incrementCompleted !== false;

    let progress = await this.getCourseProgress(userId, courseId);
    if (!progress) {
      progress = this.progressRepo.create({ userId, courseId });
    }

    const alreadyCompleted = progress.status === 'completed';

    progress.status      = 'completed';
    progress.score       = score;
    progress.xpEarned    = alreadyCompleted ? progress.xpEarned : xpReward;
    progress.completedAt = progress.completedAt ?? new Date();
    await this.progressRepo.save(progress);

    const stats       = await this.getStats(userId);
    const levelBefore = stats.level;

    if (!alreadyCompleted) {
      stats.totalXp += xpReward;
      if (incrementCompleted) stats.completedCourses += 1;
      stats.level = calculateLevel(stats.totalXp);
    }

    // Streak update
    const today     = getTodayDate();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;

    if (stats.lastActivityDate === today) {
      // already active today — no change
    } else if (stats.lastActivityDate === yesterday) {
      stats.currentStreak  += 1;
      stats.longestStreak   = Math.max(stats.longestStreak, stats.currentStreak);
    } else {
      stats.currentStreak   = 1;
    }
    stats.lastActivityDate = today;

    await this.statsRepo.save(stats);

    return { progress, stats, levelUp: stats.level > levelBefore };
  }
}
