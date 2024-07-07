import { AccountTb } from '@prisma/client';
import { FollowListPagerble } from './dto/follow-list-pagerble';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoginUser } from '../../src/auth/model/login-user.model';

@Injectable()
export class FollowService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFollowStatus(userIdx: number, toUserIdx: number): Promise<boolean> {
    const followStatus = await this.prismaService.followTb.findMany({
      where: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });

    console.log('followStatus', followStatus);

    return followStatus ? true : false;
  }

  followUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  unfollowUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  // getFollowingList: (userIdx: number) => Promise<UserEntity[]>;

  // getFollwersList: (userIdx: number) => Promise<UserEntity[]>;

  async getFollowingList(
    followListPagerble: FollowListPagerble,
    loginUser?: LoginUser | undefined,
  ): Promise<{ totalCount: number; followList: UserEntity[] }> {
    //팔로우리스트가져오기
    console.log('실행');
    console.log(loginUser);

    const followList = await this.prismaService.followTb.findMany({
      include: {
        followee: {
          select: {
            idx: true,
            email: true,
            nickname: true,
            profile: true,
            profileImgTb: {
              select: {
                imgPath: true,
              },
            },
          },
        },
      },
      where: {
        followerIdx: followListPagerble.userIdx,
      },
      skip: (followListPagerble.page - 1) * followListPagerble.take,
      take: followListPagerble.take,
    });

    console.log(followList);

    let userList = followList.map((elem) => ({
      idx: elem.followee.idx,
      email: elem.followee.email,
      nickname: elem.followee.nickname,
      profile: elem.followee.profile,
      profileImg: elem.followee.profileImgTb[0].imgPath,
      isFollowing: false,
    }));

    // if (loginUser) {
    //   console.log('팔로우 검증실행');
    //   userList = await Promise.all(
    //     userList.map(async (elem) => {
    //       const isFollowing = await this.getFollowStatus(
    //         loginUser.idx,
    //         elem.idx,
    //       );
    //       return { ...elem, isFollowing };
    //     }),
    //   );
    // }

    return {
      totalCount: 10,
      followList: userList.map((elem) => new UserEntity(elem)),
    };
  }

  //팔로워리스트 가져오기
  async getFollowerList(): Promise<UserEntity> {
    return;
  }
}
