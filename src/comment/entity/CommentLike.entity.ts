import { ApiProperty } from '@nestjs/swagger';

export class CommentLikeEntity {
  @ApiProperty({ example: '1', description: '유저 idx' })
  userIdx: number;

  @ApiProperty({ example: '2', description: '댓글 idx' })
  commentIdx: number;

  @ApiProperty({ example: '1', description: '작성일' })
  createdAt: Date;

  constructor(data) {
    this.userIdx = data.userIdx;
    this.commentIdx = data.commentIdx;
    this.createdAt = data.createAt;
  }
}
