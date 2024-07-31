import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '제목입니다', description: '리뷰 제목' })
  @IsString()
  @Length(1, 40)
  title: string;

  @ApiProperty({ example: '내용입니다', description: '리뷰 내용' })
  @IsString()
  @Length(1, 200)
  content: string;

  @ApiProperty({ example: '4.5', description: '별점 최대 5점' })
  @IsNumber()
  @Min(0)
  @Max(5)
  score: number;

  @ApiProperty({ example: 'example', description: '태그, 리스트 형태' })
  @IsArray()
  tags: string[];
}
