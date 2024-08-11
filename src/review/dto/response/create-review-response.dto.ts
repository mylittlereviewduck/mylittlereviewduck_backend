import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewResponseDto {
  @ApiProperty({ example: '제목입니다' })
  title: string;

  @ApiProperty({ example: '내용입니다' })
  content: string;

  @ApiProperty({ example: '4.5' })
  score: number;

  @ApiProperty({ examples: ['태그1', '태그2', '태그3'] })
  tags: string[];
}
