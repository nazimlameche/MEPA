import { IsString, IsArray, ValidateNested, IsIn, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class AikoChatMessage {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(2000)
  content!: string;
}

export class AikoChatDto {
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => AikoChatMessage)
  messages!: AikoChatMessage[];

  // CNIL: contexte = contenu pédagogique du chapitre, jamais de PII
  @IsString()
  @MaxLength(8000)
  context!: string;
}
