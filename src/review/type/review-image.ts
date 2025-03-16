import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewImage {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  content: string | null;
}
