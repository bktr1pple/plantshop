import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

function normalizeLowercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(({ value }) => normalizeLowercaseString(value))
  @IsEmail()
  @MaxLength(191)
  email: string;

  @IsString()
  @MaxLength(128)
  password: string;

  @IsString()
  @MaxLength(4096)
  captchaToken: string;
}
