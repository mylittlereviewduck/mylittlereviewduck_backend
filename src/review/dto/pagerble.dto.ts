import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PagerbleDto {
  @ApiProperty({
    description: '한 페이지에 담긴 리뷰 수',
    default: 10,
  })
  @Type(() => Number)
  size: number = 10;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  @Type(() => Number)
  page: number = 1;
}
