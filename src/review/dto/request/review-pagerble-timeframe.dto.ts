import { ApiProperty } from '@nestjs/swagger';
import { ReviewPagerbleDto } from './review-pagerble.dto';
import { IsIn, IsOptional } from 'class-validator';
import { ReviewTimeframe } from 'src/review/type/review-timeframe';

export class ReviewPagerbleTimeFrameDto extends ReviewPagerbleDto {
  @ApiProperty({
    description:
      '검색기간: "1D" or "7D" or "1M" or 1Y" or all 로 주어져야합니다.',
    default: 'all',
  })
  @IsIn(['1D', '7D', '1M', '1Y', 'all'])
  @IsOptional()
  timeframe: ReviewTimeframe = 'all';
}
