import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReviewPagerbleDto {
  @ApiProperty({
    description: '한 페이지에 담긴 리뷰 수',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10) || 10)
  size: number = 10;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page: number = 1;

  userIdx?: string;
}
