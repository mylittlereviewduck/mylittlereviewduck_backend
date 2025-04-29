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
    example: 0,
    description: '카테고리, 기본값 0',
  })
  @IsInt()
  @Min(1)
  @Max(10)
  category: number = 1;

  @ApiProperty({
    example: 'published',
    description:
      '공지사항 상태, draft/published/archived 중 하나, 기본값 published',
    enum: ['draft', 'published', 'archived'],
  })
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: '상태는 draft, published, archived 중 하나여야 합니다',
  })
  status: string = 'published';
}
