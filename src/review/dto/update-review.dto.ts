import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { IsEqualLength } from '../review-img-content.validator';

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

  @ApiProperty({
    example:
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
    description: '썸네일 이미지',
  })
  @IsString()
  thumbnail: string;

  @ApiProperty({
    example: '썸네일 이미지 설명',
    description: '썸네일 이미지 설명',
  })
  @IsString()
  thumbnailContent: string;

  @ApiProperty({
    example: [
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723962576545',
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723962576545',
    ],
    description: '이미지 주소, 6개제한',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  @IsOptional()
  images: string[];

  @ApiProperty({
    example: [
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
    ],
    description: '이미지 주소 리스트, 6개 제한',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  @IsOptional()
  @Validate(IsEqualLength, ['images'])
  imgContent: string[];
}
