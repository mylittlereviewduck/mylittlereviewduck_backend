import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

const user = Prisma.validator<Prisma.AccountTbDefaultArgs>()({
  include: {
    profileImgTb: true,

    _count: {
      select: {
        follower: true,
        followee: true,
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

  @ApiProperty({ example: '유저 프로필 소개', description: '유저 프로필' })
  profile: string | null;

  @ApiProperty({ example: 'example.png', description: '프로필 이미지 경로' })
  profileImg: string | null;

  @ApiProperty({ example: '닉네임', description: '닉네임' })
  nickname: string;

  @ApiProperty({ example: '스포츠', description: '관심사1, 없으면 null' })
  interest1: string | null;

  @ApiProperty({ example: '여행', description: '관심사2, 없으면 null' })
  interest2: string | null;

  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '가입일' })
  createdAt: Date;

  @ApiProperty({
    example: '111',
    description: '팔로잉수',
    nullable: true,
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
    this.profileImg = data.profileImgTb[0].imgPath;
    this.nickname = data.nickname;
    this.interest1 = data.interest1;
    this.interest2 = data.interest2;
    this.createdAt = data.createdAt;
    this.followingCount = data._count.followee;
    this.followerCount = data._count.follower;
  }
}
