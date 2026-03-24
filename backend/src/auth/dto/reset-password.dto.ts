import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class ResetPasswordDto {
  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsString()
  @MinLength(32)
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
