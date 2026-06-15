import { IsEmail, IsString, MinLength, IsIn, IsInt, Min, Max } from 'class-validator';
import { SIGNUP_ROLES, type SignupRole } from '@ai-edu/shared';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(SIGNUP_ROLES)
  role!: SignupRole;

  /** CNIL: used to determine if parental consent is required */
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear!: number;
}
