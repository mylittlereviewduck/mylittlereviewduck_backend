import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ReviewUserEntity } from 'src/review/entity/ReviewUser.entity';

const comment = Prisma.validator<Prisma.CommentTbDefaultArgs>()({
  include: {
    accountTb: {
      include: {
        profileImgTb: true,
      },
    },
    _count: {
      select: {
        commentLikeTb: true,
      },
    },
  },
});

type Comment = Prisma.CommentTbGetPayload<typeof comment>;

export class CommentEntity {
  @ApiProperty({ example: 1, description: '댓글 idx' })
  idx: number;

  @ApiProperty({
    example: {
      isFollowing: false,
      isBlocked: false,
      isReported: false,
      idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
      email: 'test1@a.com',
      profile: null,
      profileImg: 'default_img',
      nickname: '23번째 오리',
      createdAt: '2024-08-20T11:36:44.732Z',
    },
    description: '작성자',
  })
  user: ReviewUserEntity;

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

  @ApiProperty({ example: true, description: '좋아요여부' })
  isMyLike: boolean = false;

  constructor(data: Comment) {
    this.idx = data.idx;
    this.user = new ReviewUserEntity(data.accountTb);
    this.reviewIdx = data.reviewIdx;
    this.commentIdx = data.commentIdx;
    this.content = data.content;
    this.createdAt = data.createdAt;
  }
}
