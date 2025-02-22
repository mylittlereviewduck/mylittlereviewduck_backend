import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PagerbleDto {
  @ApiProperty({
    description: '한페이지에 가져올 사이즈',
    default: 10,
    required: false,
  })
  @IsOptional()
  size: number = 10;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  page: number = 1;
}
