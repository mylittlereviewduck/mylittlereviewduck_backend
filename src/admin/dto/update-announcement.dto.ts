import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiProperty({
    example: '공지사항 제목입니다',
    description: '공지사항 제목, 1-200글자 제한, 미지정 시 기존 값 유지',
    required: false,
  })
  @ValidateIf((o) => o.title !== undefined)
  @Length(1, 200)
  @IsString()
  title?: string;

  @ApiProperty({
    example: '공지사항 내용',
    description: '공지사항 내용, 1-3000글자 제한, 미지정 시 기존 값 유지.',
    required: false,
  })
  @ValidateIf((o) => o.content !== undefined)
  @Length(1, 3000)
  @IsString()
  content?: string;

  @ApiProperty({
    example: 1,
    description: '카테고리, 1-10범위, 미지정 시 기존 값 유지.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  category?: number;

  @ApiProperty({
    example: 'published',
    description: `공지사항 상태, draft/published/archived 중 하나,  
       기본값 published  
       draft -> 초안, 게시되지 않음.  
       published -> 게시됨.  
       archived -> 보관됨/게시 후 내려감.  
       미지정 시 기존 값 유지`,
    enum: ['draft', 'published', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: '상태는 draft, published, archived 중 하나여야 합니다',
  })
  status?: string;

  @ApiProperty({
    example: 'true',
    description: `상단 고정여부, 미지정 시 기존 값 유지`,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
