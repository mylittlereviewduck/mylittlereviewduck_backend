import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetReviewWithSearchDto {
  @ApiProperty({
    description: '한 페이지에 담긴 리뷰 수',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  size?: number;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    description: '한 페이지에 담긴 리뷰 수',
  })
  search: string;
}
