import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';

export class HotReviewPagerbleDto extends PagerbleDto {
  @ApiProperty({
    description: '검색기간: "1D" or "7D" or "1M" 중 하나로 주어져야합니다.',
    default: '1D',
    required: false,
  })
  @IsIn(['1D', '7D', '1M'])
  @IsOptional()
  timeframe: '1D' | '7D' | '1M' = '1D';
}
