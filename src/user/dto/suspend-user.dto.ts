import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({
    description: '정지기간: "7D" or "1M " or "blackList" 로 주어져야함',
  })
  @IsIn(['7D', '1M', 'blackList'])
  timeframe: '7D' | '1M' | 'blackList';
}
