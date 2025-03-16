import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewImage {
  @IsString()
  @IsNotEmpty()
  imgPath: string;

  @IsOptional()
  content: string | null;
}
