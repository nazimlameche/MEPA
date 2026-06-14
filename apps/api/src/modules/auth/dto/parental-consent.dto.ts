import { IsEmail, IsUUID } from 'class-validator';

export class ParentalConsentDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  parentEmail!: string;
}
