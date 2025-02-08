import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadReviewImageResponseDto {
  @ApiProperty({
    example: 'www.amazon-s3/example.com',
    description: '이미지 저장경로 반환',
  })
  @IsString()
  imgPath: string;
}
