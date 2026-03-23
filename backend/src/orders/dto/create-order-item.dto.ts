import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plantId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
