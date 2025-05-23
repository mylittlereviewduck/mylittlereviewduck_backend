import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    example: '공지사항 제목입니다',
    description: '공지사항 제목, 1-200글자 제한',
  })
  @Length(1, 200)
  @IsString()
  title: string;

  @ApiProperty({
    example: '공지사항 내용',
    description: '공지사항 내용, 1-3000글자 제한',
  })
  @Length(1, 3000)
  @IsString()
  content: string;

  @ApiProperty({
    example: 1,
    description: '카테고리, 1-10범위, 기본값 1',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  category: number = 1;

  @ApiProperty({
    example: 'published',
    description: `공지사항 상태, draft/published/archived 중 하나,  
       기본값 published  
       draft -> 초안, 게시되지 않음.  
       published -> 게시됨.  
       archived -> 보관됨/게시 후 내려감.  `,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  })
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: '상태는 draft, published, archived 중 하나여야 합니다',
  })
  status: string = 'published';
}
