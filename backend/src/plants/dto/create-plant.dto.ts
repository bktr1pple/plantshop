import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
