import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
