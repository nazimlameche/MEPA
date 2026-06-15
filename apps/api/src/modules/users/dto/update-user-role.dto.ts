import { IsIn, IsInt, Min, Max } from 'class-validator';
import { SIGNUP_ROLES, type SignupRole } from '@ai-edu/shared';

export class UpdateUserRoleDto {
  @IsIn(SIGNUP_ROLES)
  role!: SignupRole;

  /** CNIL: year of birth — used to compute parental consent requirement */
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear!: number;
}
