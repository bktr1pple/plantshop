import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

function normalizeLowercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class RegisterDto {
  @Transform(({ value }) => normalizeLowercaseString(value))
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  captchaToken: string;
}
