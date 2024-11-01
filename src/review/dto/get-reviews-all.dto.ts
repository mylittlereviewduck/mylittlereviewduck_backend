import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ReviewTimeframe } from '../type/review-timeframe.dto';
import { Type } from 'class-transformer';

export class GetReviewsAllDto {
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
  page?: number;

  userIdx?: string;

  @ApiProperty({
    description:
      '검색기간: "1D" or "7D" or "1M" or 1Y" or all 로 주어져야합니다.',
    default: 'all',
  })
  @IsIn(['1D', '7D', '1M', '1Y', 'all'])
  @IsOptional()
  timeframe: ReviewTimeframe = 'all';
}
