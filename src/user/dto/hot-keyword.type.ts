import { ApiProperty } from '@nestjs/swagger';

export class HotKeyword {
  @ApiProperty({ description: '인기 검색어 순위입니다.', example: '1' })
  rank: number;

  @ApiProperty({ description: '인기 검색어(키워드) 입니다.', example: '오리' })
  keyword: string;

  @ApiProperty({
    description:
      '인기 검색어 상태입니다. "up" | "down" | "equal" | "new" 중 하나로만 표기됩니다.',
    example: 'up',
  })
  status: HotStatusType;
}

export type HotStatusType = 'up' | 'down' | 'equal' | 'new';
