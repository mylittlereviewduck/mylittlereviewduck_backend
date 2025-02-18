import { ApiProperty } from '@nestjs/swagger';
import { HotKeyword } from '../hot-keyword.type';

export class HotKeywordResponseDto {
  @ApiProperty({
    isArray: true,
    type: HotKeyword,
    example: [
      {
        rank: 1,
        keyword: '오리',
        status: 'up',
      },
      {
        rank: 2,
        keyword: '호랑이',
        status: 'down',
      },
      {
        rank: 3,
        keyword: '강아지',
        status: 'equal',
      },
      {
        rank: 4,
        keyword: '낙타',
        status: 'new',
      },
    ],
  })
  keywords: HotKeyword[];
}
