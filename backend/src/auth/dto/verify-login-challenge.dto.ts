import { Transform } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

function normalizeChallengeId(value: unknown): unknown {
  return typeof value === 'string' ? Number(value) : value;
}

function normalizeTrimmedString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class VerifyLoginChallengeDto {
  @Transform(({ value }) => normalizeChallengeId(value))
  @IsInt()
  @Min(1)
  challengeId: number;

  @Transform(({ value }) => normalizeTrimmedString(value))
  @IsString()
  @Length(6, 6)
  code: string;
}
