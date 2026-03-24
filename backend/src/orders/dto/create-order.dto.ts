import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

function trimStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalStringValue(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class CreateOrderDto {
  @Transform(({ value }) => trimStringValue(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @Transform(({ value }) => trimStringValue(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  customerPhone!: string;

  @Transform(({ value }) => trimStringValue(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  deliveryAddress!: string;

  @Transform(({ value }) => trimOptionalStringValue(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
