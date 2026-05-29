import { IsString, MinLength, MaxLength } from 'class-validator';

export class EvaluatePromptDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  userPrompt!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  expectedOutput!: string;
}
