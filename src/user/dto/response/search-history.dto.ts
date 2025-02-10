import { ApiProperty } from '@nestjs/swagger';

export class SearchHistoryResponseDto {
  @ApiProperty({
    description: '검색키워드 10개',
    example: ['공책', '무선이어폰', '꽃', '브리또', '졸업식', '스마트폰'],
  })
  keywords: string[];
}
