import { ApiProperty } from '@nestjs/swagger';

export class CommentEntity {
  @ApiProperty({ example: 1, description: '댓글 idx' })
  idx: number;

  @ApiProperty({ example: 1, description: '유저 idx' })
  userIdx: number;

  @ApiProperty({ example: 1, description: '리뷰 idx' })
  reviewIdx: number;

  @ApiProperty({
    example: 1,
    description: '대댓글일 경우 존재, 대댓글이 달린 댓글 idx',
  })
  commentIdx?: number | undefined;

  @ApiProperty({ example: '댓글내용입니다', description: '댓글 내용' })
  content: string;

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '댓글 작성시간 타임스탬프',
  })
  createdAt: Date;

  @ApiProperty({ example: true, description: '차단여부' })
  isMyBlock: boolean = false;

  constructor(data) {
    this.idx = data.idx;
    this.userIdx = data.userIdx;
    this.reviewIdx = data.reviewIdx;
    this.commentIdx = data.commentIdx;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.isMyBlock = data.isMyBlock || false;
  }
}
