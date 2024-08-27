import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '유저 idx',
  })
  idx: string;

  @ApiProperty({ example: 'abc123@naver.com', description: '이메일형식' })
  email: string;

  @ApiProperty({ example: '유저 프로필 소개', description: '유저 프로필' })
  profile: string;

  @ApiProperty({ example: 'example.png', description: '프로필 이미지 경로' })
  profileImg: string;

  @ApiProperty({ example: '닉네임', description: '닉네임' })
  nickname: string;

  @ApiProperty({ example: '스포츠', description: '관심사1' })
  interest1?: string;

  @ApiProperty({ example: '여행', description: '관심사2' })
  interest2?: string;

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
    example: '1',
    description: '신고횟수',
    nullable: true,
  })
  reportCount?: number;

  @ApiProperty({
    example: 'true',
    description: '팔로우여부',
  })
  isFollowing: boolean = false;

  @ApiProperty({
    example: 'false',
    description: '차단여부',
  })
  isBlocked: boolean = false;

  @ApiProperty({
    example: 'false',
    description: '신고여부',
  })
  isReported: boolean = false;

  constructor(data: Partial<UserEntity>) {
    this.idx = data.idx;
    this.email = data.email;
    this.profile = data.profile;
    this.profileImg = data.profileImg;
    this.nickname = data.nickname;
    this.interest1 = data.interest1;
    this.interest2 = data.interest2;
    this.createdAt = data.createdAt;
    this.followingCount = data.followingCount;
    this.followerCount = data.followerCount;
    this.reportCount = data.reportCount;
    this.isFollowing = data.isFollowing ?? false;
    this.isBlocked = data.isBlocked ?? false;
    this.isReported = data.isReported ?? false;
  }
}
