import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function normalizeLowercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class RegisterDto {
  @Transform(({ value }) => normalizeLowercaseString(value))
  @IsEmail()
  @MaxLength(191)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=\S+$)(?=.*\p{L})(?=.*\d).+$/u, {
    message:
      'Пароль має містити щонайменше одну літеру, одну цифру і не містити пробілів',
  })
  password: string;

  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsString()
  @MaxLength(4096)
  captchaToken: string;
}
