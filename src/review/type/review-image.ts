import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class ReviewImage {
  @ApiProperty({
    example:
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723963141509',
    description: '이미지 URL',
  })
  @IsString()
  @IsUrl() // URL 형식 검사
  image: string;

  @ApiProperty({
    example: '이미지 설명1',
    description: '이미지 설명',
  })
  @IsString()
  @Length(0, 32)
  @IsOptional()
  content: string | null;
}
