import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

const user = Prisma.validator<Prisma.AccountTbDefaultArgs>()({
  include: {
    _count: {
      select: {
        followers: true,
        followings: true,
        reviewTb: true,
      },
    },
  },
});

export type User = Prisma.AccountTbGetPayload<typeof user>;

export class UserEntity {
  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '유저 idx',
  })
  idx: string;

  @ApiProperty({ example: 'abc123@naver.com', description: '이메일형식' })
  email: string;

  //prettier-ignore
  @ApiProperty({example: '유저 프로필 소개',description: '유저 프로필', nullable: true})
  profile: string | null;

  //prettier-ignore
  @ApiProperty({example: 'kakao', description: '가입경로(local, kakao, naver)'})
  provider: string;

  //prettier-ignore
  @ApiProperty({ example: 'example.png', description: '프로필 이미지 경로', nullable: true })
  profileImg: string | null;

  @ApiProperty({ example: '닉네임', description: '닉네임' })
  nickname: string;

  //prettier-ignore
  @ApiProperty({ example: '스포츠', description: '관심사1, 없으면 null', nullable: true })
  interest1: string | null;

  //prettier-ignore
  @ApiProperty({ example: '여행', description: '관심사2, 없으면 null',nullable: true })
  interest2: string | null;

  @ApiProperty({ example: 'false', description: '관리자 여부' })
  isAdmin: boolean;

  @ApiProperty({ example: '57', description: '시리얼넘버' })
  serialNumber: number;

  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '가입일' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '정지횟수' })
  suspensionCount: number;

  //prettier-ignore
  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '정지기간',nullable: true })
  suspendExpireAt: Date | null;

  @ApiProperty({ example: '30', description: '작성한 리뷰 수' })
  reviewCount: number;

  @ApiProperty({
    example: '111',
    description: '팔로잉수',
  })
  followingCount?: number;

  @ApiProperty({
    example: '112',
    description: '팔로워수',
    nullable: true,
  })
  followerCount?: number;

  @ApiProperty({
    example: 'true',
    description: '팔로우여부',
  })
  isMyFollowing: boolean = false;

  @ApiProperty({
    example: 'false',
    description: '차단여부',
  })
  isMyBlock: boolean = false;

  constructor(data: User) {
    this.idx = data.idx;
    this.email = data.email;
    this.profile = data.profile;
    this.provider = data.provider;
    //prettier-ignore
    this.profileImg = data.profileImg;
    this.nickname = data.nickname;
    this.interest1 = data.interest1;
    this.interest2 = data.interest2;
    this.isAdmin = data.isAdmin;
    this.serialNumber = data.serialNumber;
    this.suspensionCount = data.suspensionCount;
    this.suspendExpireAt = data.suspendExpireAt;
    this.reviewCount = data._count.reviewTb;
    this.createdAt = data.createdAt;
    this.followerCount = data._count.followers;
    this.followingCount = data._count.followings;
  }
}
