import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({
    description:
      '정지기간: "7D" or "1M " or "blackList" 로 주어져야함, blackList는 영구정지,  기본값 7일',
    default: '7D',
    required: false,
  })
  @IsIn(['7D', '1M', 'blackList'])
  @IsOptional()
  timeframe: userSuspendPeriod = '7D';
}

export type userSuspendPeriod = '7D' | '1M' | 'blackList';
