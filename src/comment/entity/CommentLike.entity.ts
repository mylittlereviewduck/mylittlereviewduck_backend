import { ApiProperty } from '@nestjs/swagger';

export class CommentLikeEntity {
  @ApiProperty({ example: '1', description: '유저 idx' })
  userIdx: number;

  @ApiProperty({ example: '2', description: '댓글 idx' })
  commentIdx: number;

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '작성시간 타임스탬프',
  })
  createdAt: Date;

  constructor(data) {
    this.userIdx = data.accountIdx;
    this.commentIdx = data.commentIdx;
    this.createdAt = data.createAt;
  }
}
