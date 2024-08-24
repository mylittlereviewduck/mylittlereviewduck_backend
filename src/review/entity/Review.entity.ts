import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { UserEntity } from 'src/user/entity/User.entity';

export class ReviewEntity {
  @ApiProperty({ example: 1, description: '리뷰 idx' })
  idx: number;

  @ApiProperty({
    example: `{
      "idx": "de1704a4-bdd4-4df5-8fe8-053338cbac44",
      "email": "abc123@naver.com",
      "profile": "유저 프로필 소개",
      "profileImg": "example.png",
      "nickname": "닉네임",
      "createdAt": "2024-08-01T07:58:57.844Z",
      "followingCount": 111,
      "followerCount": 112,
      "reportCount": 1,
      "isFollowing": true,
      "isBlocked": false,
      "isReported": false
    }`,
    description: '작성자',
  })
  user: UserEntity;

  @ApiProperty({ example: '제목입니다', description: '제목 255자' })
  title: string;

  @ApiProperty({ example: '내용입니다', description: '내용 글자제한X' })
  content: string;

  @ApiProperty({ example: '3.5', description: '평점 1.0-5.0점' })
  score: Decimal;

  @ApiProperty({
    example: ['태그1', '태그2', '태그3'],
    description: '태그 개수 제한x',
    nullable: true,
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

  @ApiProperty({
    example: '3',
    description: '신고횟수',
  })
  reportCount: number = 0;

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

  constructor(data: Partial<ReviewEntity>) {
    this.idx = data.idx;
    this.user = new UserEntity(data.user);
    this.title = data.title;
    this.content = data.content;
    this.score = data.score;
    this.tags = data.tags;
    this.images = data.images;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.viewCount = data.viewCount ?? 0;
    this.likeCount = data.likeCount ?? 0;
    this.dislikeCount = data.dislikeCount ?? 0;
    this.bookmarkCount = data.bookmarkCount ?? 0;
    this.shareCount = data.shareCount ?? 0;
    this.reportCount = data.reportCount ?? 0;
    this.isMyLike = data.isMyLike ?? false;
    this.isMyDislike = data.isMyDislike ?? false;
    this.isMyBookmark = data.isMyBookmark ?? false;
    this.isMyShare = data.isMyShare ?? false;
    this.isMyBlock = data.isMyBlock ?? false;
  }
}
