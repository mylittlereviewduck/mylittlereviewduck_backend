import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ReviewImage } from '../../type/review-image';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    example: '제목입니다',
    description: '리뷰 제목',
    required: true,
  })
  @IsString()
  @Length(1, 150)
  title: string;

  @ApiProperty({
    example: '내용입니다',
    description: '리뷰 내용',
    required: true,
  })
  @IsString()
  @Length(1, 5000)
  content: string;

  @ApiProperty({ example: '3', description: '별점 0-5점', required: true })
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;

  @ApiProperty({
    example: ['태그1', '태그2', '태그3'],
    description: '태그, 리스트 형태, 0-10개, 각 16자 제한',
    required: false,
  })
  @IsArray({})
  @ArrayMaxSize(10)
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
  thumbnail?: string | null;

  @ApiProperty({
    example: '썸네일 이미지 설명',
    description: '썸네일 이미지 설명',
    required: false,
  })
  @Length(0, 32)
  @IsString()
  @IsOptional()
  thumbnailContent?: string | null;

  @ApiProperty({
    example: [
      {
        imgPath:
          'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
        content: '이미지 설명1',
      },
      {
        imgPath:
          'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
        content: '이미지 설명2',
      },
    ],
    description: '이미지 리스트, 6개 제한',
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ReviewImage)
  @IsOptional()
  images?: ReviewImage[];
}
