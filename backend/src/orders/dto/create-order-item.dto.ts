import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  plantId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}
