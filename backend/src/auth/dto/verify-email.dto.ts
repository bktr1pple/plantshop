import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class VerifyEmailDto {
  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsString()
  @MinLength(32)
  token: string;
}
