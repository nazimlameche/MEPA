import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from './quiz-attempt.entity';
import { ProgressService } from '../progress/progress.service';

export interface SaveAttemptDto {
  userId:      string;
  exerciseId:  string;
  userPrompt:  string;
  totalScore:  number;
  passed:      boolean;
  scoreDetail: unknown;
}

const XP_PERFECT_SCORE = 25;
const XP_PARTIAL_SCORE = 10;

@Injectable()
export class PromptingService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly repo: Repository<QuizAttempt>,
    private readonly progressService: ProgressService,
  ) {}

  async saveAttempt(dto: SaveAttemptDto): Promise<{ attempt: QuizAttempt; xpEarned: number }> {
    const xpEarned = dto.passed ? XP_PERFECT_SCORE : XP_PARTIAL_SCORE;

    // CNIL: le prompt est stocké sans données identifiantes (userId est un UUID opaque)
    const attempt = this.repo.create({
      userId:      dto.userId,
      exerciseId:  dto.exerciseId,
      userPrompt:  dto.userPrompt,
      totalScore:  dto.totalScore,
      passed:      dto.passed,
      xpEarned,
      scoreDetail: dto.scoreDetail,
    });
    await this.repo.save(attempt);

    if (dto.passed) {
      await this.progressService.completeCourse(
        dto.userId,
        `prompting-${dto.exerciseId}`,
        xpEarned,
        dto.totalScore,
      );
    }

    return { attempt, xpEarned };
  }

  getAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    return this.repo.find({
      where: { userId },
      order: { attemptedAt: 'DESC' },
      take:  20,
    });
  }

  async getBestScore(userId: string, exerciseId: string): Promise<number | null> {
    const best = await this.repo.findOne({
      where: { userId, exerciseId },
      order: { totalScore: 'DESC' },
    });
    return best?.totalScore ?? null;
  }
}
