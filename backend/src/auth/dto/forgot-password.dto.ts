import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

function normalizeLowercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class ForgotPasswordDto {
  @Transform(({ value }) => normalizeLowercaseString(value))
  @IsEmail()
  email: string;
}
