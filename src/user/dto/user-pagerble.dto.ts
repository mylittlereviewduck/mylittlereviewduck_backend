import { ApiProperty } from '@nestjs/swagger';

export class UserPagerbleDto {
  @ApiProperty({
    description: '한페이지에 가져올 사이즈',
    default: 10,
  })
  size?: number;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  page?: number;

  userIdx?: string;
}
