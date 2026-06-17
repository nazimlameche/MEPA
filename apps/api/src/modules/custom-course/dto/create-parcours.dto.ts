import { IsString, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateParcoursDto {
  /** CNIL: thème libre — pas de données personnelles (prénom, école, adresse) */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  theme!: string;

  @IsIn(['college', 'lycee', 'adulte'])
  level!: 'college' | 'lycee' | 'adulte';
}
