import { IsIn, IsObject } from 'class-validator';

export class SaveChapterContentDto {
  @IsIn(['ready', 'error'])
  status!: 'ready' | 'error';

  @IsObject()
  content!: Record<string, unknown>;
}
