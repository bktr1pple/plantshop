import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

function normalizeLowercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(({ value }) => normalizeLowercaseString(value))
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  captchaToken: string;
}
