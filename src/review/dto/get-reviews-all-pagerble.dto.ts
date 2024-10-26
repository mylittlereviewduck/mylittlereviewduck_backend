import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { ReviewTimeframe } from '../type/review-timeframe.dto';
import { Transform } from 'class-transformer';

export class GetReviewsAllPagerbleDto {
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

  @ApiProperty({
    description: '유저식별자',
  })
  @IsOptional()
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
