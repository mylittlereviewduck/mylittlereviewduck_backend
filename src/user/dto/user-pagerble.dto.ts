import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserPagerbleDto {
  @ApiProperty({
    description: '한페이지에 가져올 사이즈',
    default: 10,
  })
  @Type(() => Number)
  size: number = 20;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  @Type(() => Number)
  page: number = 1;
}
