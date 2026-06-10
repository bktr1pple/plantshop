import { IsString, MaxLength } from 'class-validator';

export class DeleteMediaDto {
  @IsString()
  @MaxLength(2048)
  url: string;
}
