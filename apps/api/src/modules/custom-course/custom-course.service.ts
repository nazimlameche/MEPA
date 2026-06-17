import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomCourseParcours } from './entities/custom-course-parcours.entity';
import { CustomCourseChapter } from './entities/custom-course-chapter.entity';
import { GeneratedCourseEntity } from './generated-course.entity';
import { ProgressService } from '../progress/progress.service';
import { AuditService } from '../audit/audit.service';
import { CreateParcoursDto } from './dto/create-parcours.dto';
import { SaveChapterContentDto } from './dto/save-chapter-content.dto';

// Mirror of frontend CHAPTER_TEMPLATES — kept in sync manually
const CHAPTER_TEMPLATES_BE = [
  { index: 0, key: 'comprendre-ia',         defaultTitle: "Comprendre l'IA",        xpReward: 20 },
  { index: 1, key: 'bon-prompting',          defaultTitle: 'Bon prompting',          xpReward: 20 },
  { index: 2, key: 'atelier-prompting',      defaultTitle: 'Atelier prompting',      xpReward: 25 },
  { index: 3, key: 'securite',               defaultTitle: 'Sécurité & données',     xpReward: 20 },
  { index: 4, key: 'impact-environnemental', defaultTitle: 'Impact environnemental', xpReward: 20 },
  { index: 5, key: 'ethique',                defaultTitle: 'Éthique & usages',       xpReward: 25 },
] as const;

const PARCOURS_TTL_DAYS = 90;

@Injectable()
export class CustomCourseService {
  constructor(
    @InjectRepository(CustomCourseParcours)
    private readonly parcoursRepo: Repository<CustomCourseParcours>,
    @InjectRepository(CustomCourseChapter)
    private readonly chapterRepo: Repository<CustomCourseChapter>,
    @InjectRepository(GeneratedCourseEntity)
    private readonly legacyRepo: Repository<GeneratedCourseEntity>,
    private readonly progressService: ProgressService,
    private readonly auditService: AuditService,
  ) {}

  async createParcours(userId: string, dto: CreateParcoursDto): Promise<CustomCourseParcours> {
    // TODO: cron job pour purger les parcours dont expiresAt < NOW()
    const expiresAt = new Date(Date.now() + PARCOURS_TTL_DAYS * 24 * 3600 * 1000);

    const chapters = CHAPTER_TEMPLATES_BE.map(t =>
      this.chapterRepo.create({
        chapterIndex: t.index,
        chapterKey:   t.key,
        title:        `${t.defaultTitle} — ${dto.theme}`,
        status:       'pending',
        xpEarned:     0,
        content:      null,
      }),
    );

    const parcours = this.parcoursRepo.create({
      userId,
      theme:    dto.theme,
      level:    dto.level,
      expiresAt,
      chapters,
    });

    const saved = await this.parcoursRepo.save(parcours);

    void this.auditService.log({
      userId,
      action:     'create_parcours',
      resource:   'custom_course_parcours',
      resourceId: saved.id,
    });

    return saved;
  }

  getUserParcours(userId: string): Promise<CustomCourseParcours[]> {
    return this.parcoursRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getParcours(id: string, userId: string): Promise<CustomCourseParcours> {
    const parcours = await this.parcoursRepo.findOne({ where: { id, userId } });
    if (!parcours) throw new NotFoundException('Parcours introuvable');
    return parcours;
  }

  async getChapter(chapterId: string, userId: string): Promise<CustomCourseChapter> {
    const chapter = await this.chapterRepo.findOne({
      where:     { id: chapterId },
      relations: ['parcours'],
    });
    if (!chapter || chapter.parcours.userId !== userId) {
      throw new NotFoundException('Chapitre introuvable');
    }
    return chapter;
  }

  async saveChapterContent(
    chapterId: string,
    userId: string,
    dto: SaveChapterContentDto,
  ): Promise<CustomCourseChapter> {
    const chapter    = await this.getChapter(chapterId, userId);
    chapter.status   = dto.status;
    chapter.content  = dto.content;
    return this.chapterRepo.save(chapter);
  }

  async completeChapter(chapterId: string, userId: string): Promise<{ xpEarned: number }> {
    const chapter = await this.getChapter(chapterId, userId);

    // Idempotent — évite de doubler les XP
    if (chapter.completedAt !== null) {
      return { xpEarned: chapter.xpEarned };
    }

    const template = CHAPTER_TEMPLATES_BE[chapter.chapterIndex];
    if (!template) throw new NotFoundException('Template de chapitre introuvable');

    chapter.completedAt = new Date();
    chapter.xpEarned    = template.xpReward;
    chapter.status      = 'completed';
    await this.chapterRepo.save(chapter);

    // CNIL: courseId préfixé 'custom-' — jamais d'identifiant personnel
    await this.progressService.completeCourse(
      userId,
      `custom-${chapterId}`,
      template.xpReward,
      100,
      { incrementCompleted: false },
    );

    return { xpEarned: template.xpReward };
  }

  async deleteParcours(id: string, userId: string): Promise<void> {
    await this.getParcours(id, userId); // ownership check
    await this.parcoursRepo.delete({ id });
    void this.auditService.log({
      userId,
      action:     'delete_parcours',
      resource:   'custom_course_parcours',
      resourceId: id,
    });
  }

  // Legacy methods kept for backward-compat (no longer used by the front)
  saveCourse(userId: string, interests: string[], content: unknown): Promise<GeneratedCourseEntity> {
    const entity = this.legacyRepo.create({ userId, interests, content });
    return this.legacyRepo.save(entity);
  }

  getSavedCourses(userId: string): Promise<GeneratedCourseEntity[]> {
    return this.legacyRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 20 });
  }

  async getSavedCourse(userId: string, id: string): Promise<GeneratedCourseEntity> {
    const entity = await this.legacyRepo.findOne({ where: { id, userId } });
    if (!entity) throw new NotFoundException('Cours introuvable');
    return entity;
  }
}
