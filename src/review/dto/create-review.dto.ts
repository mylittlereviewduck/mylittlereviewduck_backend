import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { IsEqualLength } from '../review-img-content.validator';

export class CreateReviewDto {
  @ApiProperty({ example: '제목입니다', description: '리뷰 제목' })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({ example: '내용입니다', description: '리뷰 내용' })
  @IsString()
  @Length(1, 10000)
  content: string;

  @ApiProperty({ example: '3', description: '별점 0-5점' })
  @IsInt()
  @Min(1)
  @Max(6)
  score: number;

  @ApiProperty({
    example: ['태그1', '태그2', '태그3'],
    description: '태그, 리스트 형태',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
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
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
    ],
    description: '이미지 주소 리스트, 6개 제한',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
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
  @Validate(IsEqualLength, ['images'])
  imgContent: string[];
}
