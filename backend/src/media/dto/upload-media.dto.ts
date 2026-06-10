import { IsIn, IsOptional } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsIn(['plants', 'site'])
  collection?: 'plants' | 'site';
}
