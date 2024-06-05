import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/UserEntity';

@Injectable()
export class UserService {
  constructor() {}

  async getUserByidx() {}

  async getUserByNickname() {}

  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = {};
    return;
  }

  async getMyinfo() {}

  async updateMyinfo() {}

  async updateMyProfileImg() {}

  async deleteMyProfileImg() {}
}
