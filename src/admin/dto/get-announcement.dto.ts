import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';

export class GetAnnouncementsDto extends PagerbleDto {
  @ApiProperty({
    example: 'published',
    description: `공지사항 상태, draft/published/archived 중 하나,  
       미지정 -> 모든 상태 조회  
       draft -> 초안, 게시되지 않음.  
       published -> 게시됨.  
       archived -> 보관됨/게시 후 내려감.  
      `,
    enum: ['draft', 'published', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: '상태는 draft, published, archived 중 하나여야 합니다',
  })
  status?: string;
}
