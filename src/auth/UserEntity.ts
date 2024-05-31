export class UserEntity {
  idx: number;
  email: string;
  profile: string;
  profileImg: string;
  nickname: string;

  constructor(data) {
    this.idx = data.idx;
    this.email = data.email;
    this.profile = data.profile;
    this.profileImg = data.profileImg;
    this.nickname = data.nickname;
  }
}
