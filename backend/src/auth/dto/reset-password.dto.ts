import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class ResetPasswordDto {
  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=\S+$)(?=.*\p{L})(?=.*\d).+$/u)
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmPassword: string;
}
