import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';

export class GetAnnouncementsDto extends PagerbleDto {
  @ApiProperty({
    example: 'published',
    description:
      '공지사항 상태, draft/published/archived 중 하나, 미지정 시 모든 상태 조회',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: '상태는 draft, published, archived 중 하나여야 합니다',
  })
  status?: string;
}
