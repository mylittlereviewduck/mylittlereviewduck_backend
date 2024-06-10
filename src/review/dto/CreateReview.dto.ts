import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '제목입니다', description: '리뷰 제목' })
  title: string;

  @ApiProperty({ example: '내용입니다', description: '리뷰 내용' })
  content: string;

  @ApiProperty({ example: '4.5', description: '별점 최대 5점' })
  score: number;
}
