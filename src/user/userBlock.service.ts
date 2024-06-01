import { Injectable } from '@nestjs/common';

@Injectable()
export class UserBlockService {
  constructor() {}
  async isUserBlocked(useIdx: number, 대상userIdx: number): Promise<any> {}

  async blockUser() {}

  async unBlockUser() {}

  async getBlockedUserAll() {}
}
