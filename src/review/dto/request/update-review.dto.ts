import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ReviewImage } from '../../type/review-image';

export class UpdateReviewDto {
  reviewIdx?: number;

  @ApiProperty({ example: '제목', description: '리뷰 제목' })
  @IsString()
  @Length(1, 150)
  title: string;

  @ApiProperty({ example: '내용', description: '리뷰 내용' })
  @IsString()
  @Length(1, 5000)
  content: string;

  @ApiProperty({ example: 4.5, description: '별점 최대 5점' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Max(6)
  @Min(1)
  score: number;

  @ApiProperty({
    example: ['수정된 태그1', '수정된 태그2'],
    description: '태그',
  })
  @IsArray()
  @Length(1, 16, { each: true })
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    example:
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
    description: '썸네일 이미지',
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnail: string;

  @ApiProperty({
    example: '썸네일 이미지 설명',
    description: '썸네일 이미지 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnailContent: string;

  @ApiProperty({
    example: [
      {
        image:
          'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
        content: '이미지 설명1',
      },
      {
        image:
          'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
        content: '이미지 설명2',
      },
    ],
    description: '이미지 리스트, 6개 제한',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ReviewImage)
  images: ReviewImage[];
}
