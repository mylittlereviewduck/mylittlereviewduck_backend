import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  reviewIdx: number;

  @ApiProperty({ example: 1, required: false, nullable: true })
  commentIdx?: number | null;

  @ApiProperty({ example: '댓글 내용' })
  content: string;
}
