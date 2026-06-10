import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+0-9\s\-()]{7,20}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @IsString()
  @Length(10, 2000)
  message!: string;

  @IsString()
  @Length(10, 4096)
  captchaToken!: string;
}
