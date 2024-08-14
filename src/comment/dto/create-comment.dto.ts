import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 1,
    description: '대댓글일경우존재, 댓글idx',
    required: false,
    nullable: true,
  })
  commentIdx?: number | null;

  @ApiProperty({ example: '댓글 내용' })
  content: string;
}
