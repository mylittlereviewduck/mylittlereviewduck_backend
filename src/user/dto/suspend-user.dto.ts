import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({
    description: '정지기간: "7D" or "1M" or "forever" 로 주어져야함',
  })
  @IsIn(['7D', '1M', 'blackList'])
  suspendPeriod: '7D' | '1M' | 'blackList';
}
