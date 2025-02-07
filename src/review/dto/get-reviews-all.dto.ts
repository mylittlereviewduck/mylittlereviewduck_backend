import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsUUID } from 'class-validator';
import { ReviewPagerbleDto } from './request/pagerble.dto';
import { ReviewTimeframe } from '../type/review-timeframe';

export class GetReviewsAllDto extends ReviewPagerbleDto {
  @ApiProperty({
    description:
      '검색기간: "1D" or "7D" or "1M" or 1Y" or all 로 주어져야합니다.',
    default: 'all',
  })
  @IsIn(['1D', '7D', '1M', '1Y', 'all'])
  @IsOptional()
  timeframe?: ReviewTimeframe = 'all';

  @ApiProperty({ description: '작성자 식별자 (UUID)' })
  @IsOptional()
  @IsUUID()
  userIdx?: string;

  @ApiProperty({ description: '작성자 목록 (UUID 배열)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIdxs?: string[];

  scoreLte?: number;

  scoreGte?: number;
}
