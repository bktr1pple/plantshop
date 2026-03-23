import { IsIn, IsOptional } from 'class-validator';

export class ListMediaQueryDto {
  @IsOptional()
  @IsIn(['plants', 'site'])
  collection?: 'plants' | 'site';
}
