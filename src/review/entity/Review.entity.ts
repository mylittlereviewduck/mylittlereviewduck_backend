import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ReviewUserEntity } from './ReviewUser.entity';

const review = Prisma.validator<Prisma.ReviewTbDefaultArgs>()({
  include: {
    accountTb: {
      include: {
        profileImgTb: true,
      },
    },
    tagTb: true,
    reviewImgTb: true,
    _count: {
      select: {
        commentTb: true,
        reviewLikeTb: true,
        reviewDislikeTb: true,
        reviewBookmarkTb: true,
        reviewShareTb: true,
      },
    },
  },
});

export type Review = Prisma.ReviewTbGetPayload<typeof review>;

export class ReviewEntity {
  @ApiProperty({ example: 1, description: '리뷰 idx' })
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

  @ApiProperty({ example: '제목입니다', description: '제목 255자' })
  title: string;

  @ApiProperty({ example: '내용입니다', description: '내용 글자제한X' })
  content: string;

  @ApiProperty({ example: '3', description: '평점 0-5점' })
  score: number;

  @ApiProperty({
    example: ['태그1', '태그2', '태그3'],
    description: '태그 개수 제한x, 최소1개',
  })
  tags: string[];

  @ApiProperty({
    example: [
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723962576545',
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723962576545',
      'https://s3.ap-northeast-2.amazonaws.com/todayreview/1723962576545',
    ],
    description: '리뷰이미지 0-6개',
    nullable: true,
  })
  images: string[];

  @ApiProperty({
    example: ['이미지 설명1', '이미지 설명2', '이미지 설명3'],
    description: '이미지 설명, 이미지 개수와 일치',
    nullable: true,
  })
  imgContent: string[];

  @ApiProperty({
    example: '2024-08-01Tq07:58:57.844Z',
    description: '작성일 타임스탬프',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-08-01Tq07:58:57.844Z',
    description: '수정일 타임스탬프',
  })
  updatedAt: Date;

  @ApiProperty({ example: 10, description: '조회수' })
  viewCount: number = 0;

  @ApiProperty({ example: 10, description: '좋아요수' })
  likeCount: number = 0;

  @ApiProperty({ example: 10, description: '싫어요수' })
  dislikeCount: number = 0;

  @ApiProperty({ example: 10, description: '북마크수' })
  bookmarkCount: number = 0;

  @ApiProperty({ example: 10, description: '공유수' })
  shareCount: number = 0;

  @ApiProperty({ example: 10, description: '댓글수' })
  commentCount: number = 0;

  @ApiProperty({
    example: 'true',
    description: '좋아요여부',
  })
  isMyLike: boolean = false;

  @ApiProperty({
    example: 'false',
    description: '싫어요여부',
  })
  isMyDislike: boolean = false;

  @ApiProperty({
    example: 'true',
    description: '북마크여부',
  })
  isMyBookmark: boolean = false;

  @ApiProperty({
    example: 'true',
    description: '공유여부',
  })
  isMyShare: boolean = false;

  @ApiProperty({
    example: 'false',
    description: '차단여부',
  })
  isMyBlock: boolean = false;

  constructor(data: Review) {
    this.idx = data.idx;
    this.user = new ReviewUserEntity(data.accountTb);
    this.title = data.title;
    this.content = data.content;
    this.score = data.score;
    this.tags = data.tagTb.map((tag) => tag.tagName);
    this.images = data.reviewImgTb.map((img) => img.imgPath);
    this.imgContent = data.reviewImgTb.map((img) => img.content);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.viewCount = data.viewCount;
    this.likeCount = data._count.reviewLikeTb;
    this.dislikeCount = data._count.reviewDislikeTb;
    this.bookmarkCount = data._count.reviewBookmarkTb;
    this.shareCount = data._count.reviewShareTb;
    this.commentCount = data._count.commentTb;
  }
}
