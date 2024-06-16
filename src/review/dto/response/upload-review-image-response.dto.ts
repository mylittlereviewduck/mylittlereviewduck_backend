import { ApiProperty } from '@nestjs/swagger';

export class UploadReviewImageResponseDto {
  @ApiProperty({
    example: 'www.amazon-s3/example.com',
    description: '이미지 저장경로 반환',
  })
  imgPath: string;
}
