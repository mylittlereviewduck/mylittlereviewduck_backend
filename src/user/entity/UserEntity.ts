import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1 })
  idx: number;

  @ApiProperty({ example: 'abc123@naver.com', description: '이메일형식' })
  email: string;

  @ApiProperty({ example: '유저 프로필 소개', description: '유저 프로필' })
  profile: string;

  @ApiProperty({ example: 'example.png', description: '프로필 이미지 경로' })
  profileImg: string;

  @ApiProperty({ example: '닉네임', description: '닉네임' })
  nickname: string;

  @ApiProperty({
    example: 'true',
    description: '팔로우여부',
    required: false,
    nullable: true,
  })
  isFollowing?: boolean | null;

  constructor(data) {
    this.idx = data.idx;
    this.email = data.email;
    this.profile = data.profile;
    this.profileImg = data.profileImg;
    this.nickname = data.nickname;
    this.isFollowing = data.isFollowing;
  }
}
