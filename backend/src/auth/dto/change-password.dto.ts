import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  currentPassword: string;

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
