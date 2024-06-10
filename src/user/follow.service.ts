import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';

@Injectable()
export class FollowService {
  constructor() {}

  isfollowing: (userIdx: number, toUserIdx: number) => Promise<boolean>;

  followUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  unfollowUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  getFollowingList: (userIdx: number) => Promise<UserEntity[]>;

  getFollwersList: (userIdx: number) => Promise<UserEntity[]>;
}
