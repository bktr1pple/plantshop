import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlantDto {
  @IsString()
  @MaxLength(191)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @Matches(
    /^(?:\/(?!\/)[^\s]*|https:\/\/[^\s]+|http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/uploads\/[^\s]+)$/i,
    { each: true },
  )
  images?: string[];
}
