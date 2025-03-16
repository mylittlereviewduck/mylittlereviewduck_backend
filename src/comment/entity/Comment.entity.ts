import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ReviewUserEntity } from 'src/review/entity/ReviewUser.entity';

const comment = Prisma.validator<Prisma.CommentTbDefaultArgs>()({
  include: {
    accountTb: true,
    commentTagTb: {
      include: {
        accountTb: true,
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
      idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
      email: 'test1@a.com',
      nickname: '23번째 오리',
      profileImg:
        'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
      interest1: '여행',
      interest2: null,
    },
    description: '작성자',
  })
  user: ReviewUserEntity;

  @ApiProperty({ example: 1, description: '리뷰 idx' })
  reviewIdx: number;

  @ApiProperty({
    example: 1,
    description: '대댓글일 경우 존재, 대댓글이 달린 댓글 idx',
    nullable: true,
  })
  commentIdx: number | null;

  @ApiProperty({ example: '댓글내용입니다', description: '댓글 내용' })
  content: string;

  @ApiProperty({ example: '3', description: '댓글 좋아요 수' })
  likeCount: number;

  @ApiProperty({
    example: [
      {
        isMyFollowing: false,
        isMyBlock: false,
        idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
        email: 'test1@a.com',
        profile: null,
        profileImg:
          'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
        nickname: '23번째 오리',
        interest1: null,
        interest2: null,
        isAdmin: false,
        serialNumber: 23,
        suspensionCount: 17,
        suspendExpireAt: null,
        createdAt: '2024-08-20T11:36:44.732Z',
        followingCount: 6,
        followerCount: 6,
      },
    ],
    description: '태그유저 리스트, 태그유저가 없다면 빈 리스트로 반환됩니다.',
  })
  tagUsers: ReviewUserEntity[];

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '댓글 작성시간 타임스탬프',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-08-01Tq07:58:57.844Z',
    description: '수정일 타임스탬프',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiProperty({
    example: '2024-08-01Tq07:58:57.844Z',
    description: '삭제일 타임스탬프',
    nullable: true,
  })
  deletedAt: Date | null;

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
    //prettier-ignore
    this.tagUsers = data.commentTagTb[0] ? data.commentTagTb.map(tag => new ReviewUserEntity(tag.accountTb)) : [];
    this.likeCount = data._count.commentLikeTb;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
