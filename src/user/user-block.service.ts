import { Injectable } from '@nestjs/common';

@Injectable()
export class UserBlockService {
  constructor() {}

  blockUser: (useIdx: number, 대상userIdx: number) => Promise<void>;

  unBlockUser: (useIdx: number, 대상userIdx: number) => Promise<void>;

  isUserBlocked: (useIdx: number, 대상userIdx: number) => Promise<boolean>;

  getBlockedUserAll: (useIdx: number, 대상userIdx: number) => Promise<void>;
}
