import { IsEmail, IsString, MinLength, IsIn, IsInt, Min, Max } from 'class-validator';
import { ROLES, type Role } from '@ai-edu/shared';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(ROLES)
  role!: Role;

  /** CNIL: used to determine if parental consent is required */
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear!: number;
}
