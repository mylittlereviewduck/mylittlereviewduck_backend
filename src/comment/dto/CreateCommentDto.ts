import { ApiOperation, ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  userIdx: number;

  @ApiProperty({ example: 1 })
  reviewIdx: number;

  @ApiProperty({ example: 1, required: false, nullable: true })
  commentIdx: number | null;

  @ApiProperty({ example: '댓글 내용' })
  content: string;
}
