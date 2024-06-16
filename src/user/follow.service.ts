import { FollowListPagerble } from './dto/follow-list-pagerble';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUser } from 'src/auth/model/login-user.model';

@Injectable()
export class FollowService {
  constructor(private readonly prismaService: PrismaService) {}

  async isfollowing(userIdx: number, toUserIdx: number): Promise<boolean> {
    return;
  }

  followUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  unfollowUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  //두 메서드 통합하기
  // getFollowingList: (userIdx: number) => Promise<UserEntity[]>;

  // getFollwersList: (userIdx: number) => Promise<UserEntity[]>;

  async getFollowList(
    followListPagerble: FollowListPagerble,
    loginUser?: LoginUser | undefined,
  ): Promise<UserEntity[]> {
    //팔로우리스트가져오기

    let followList = await this.prismaService.followTb.findMany({
      where: {
        [followListPagerble.type]: followListPagerble.userIdx,
        followee: {
          deletedAt: null,
        },
        follower: {
          deletedAt: null,
        },
      },
      include: {},
      skip: (followListPagerble.page - 1) * followListPagerble.take,
      take: followListPagerble.take,
    });

    let userFollowList = [];

    console.log(followList);

    userFollowList =
      followListPagerble.type === 'followeeIdx'
        ? followList.map((elem) => elem.followerIdx)
        : followList.map((elem) => elem.followeeIdx);

    //followTB에서

    return followList.map((elem) => new UserEntity(elem));
  }
}
