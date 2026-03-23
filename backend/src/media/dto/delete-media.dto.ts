import { IsString } from 'class-validator';

export class DeleteMediaDto {
  @IsString()
  url: string;
}
