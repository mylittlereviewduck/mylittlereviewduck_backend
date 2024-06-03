import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1 })
  idx: number;

  @ApiProperty({ example: 'abc123@naver.com', description: '이메일형식' })
  email: string;

  @ApiProperty({ description: '유저 프로필' })
  profile: string;

  @ApiProperty({ description: '프로필 이미지 경로' })
  profileImg: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  constructor(data) {
    this.idx = data.idx;
    this.email = data.email;
    this.profile = data.profile;
    this.profileImg = data.profileImg;
    this.nickname = data.nickname;
  }
}
