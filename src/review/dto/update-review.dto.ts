import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({ example: '제목', description: '리뷰 제목' })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({ example: '내용', description: '리뷰 내용' })
  @IsString()
  @Length(1, 10000)
  content: string;

  @ApiProperty({ example: 4.5, description: '별점 최대 5점' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Max(5.0)
  @Min(1.0)
  score: number;

  @ApiProperty({
    example: ['수정된 태그1', '수정된 태그2'],
    description: '태그',
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
