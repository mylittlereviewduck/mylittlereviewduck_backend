import { AccountTb } from '@prisma/client';
import { FollowListPagerble } from './dto/follow-list-pagerble';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoginUser } from '../../src/auth/model/login-user.model';
import { elementAt } from 'rxjs';

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

    if (followStatus.length == 0) {
      return false;
    }

    return true;
  }

  followUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  unfollowUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  // getFollowingList: (userIdx: number) => Promise<UserEntity[]>;

  // getFollwersList: (userIdx: number) => Promise<UserEntity[]>;

  async getFollowingList(
    followListPagerble: FollowListPagerble,
    loginUser?: LoginUser | undefined,
  ): Promise<{ totalCount: number; followList: UserEntity[] }> {
    const getFollowingCount = await this.prismaService.followTb.count({
      where: {
        followerIdx: followListPagerble.userIdx,
      },
    });

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

    let userList = followList.map((elem) => {
      return {
        idx: elem.followee.idx,
        email: elem.followee.email,
        nickname: elem.followee.nickname,
        profile: elem.followee.profile,
        profileImg: elem.followee.profileImgTb[0].imgPath,
        isFollowing: false,
      };
    });

    if (loginUser) {
      userList = await Promise.all(
        userList.map(async (elem) => {
          const isFollowing = await this.getFollowStatus(
            loginUser.idx,
            elem.idx,
          );
          return { ...elem, isFollowing };
        }),
      );
    }

    return {
      totalCount: getFollowingCount,
      followList: userList.map((elem) => new UserEntity(elem)),
    };
  }

  //팔로워리스트 가져오기
  async getFollowerList(
    followListPagerble: FollowListPagerble,
    loginUser: LoginUser,
  ): Promise<{
    totalCount: number;
    followList: UserEntity[];
  }> {
    const getFollowerCount = await this.prismaService.followTb.count({
      where: {
        followeeIdx: followListPagerble.userIdx,
      },
    });

    const followList = await this.prismaService.followTb.findMany({
      include: {
        follower: {
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
        followeeIdx: followListPagerble.userIdx,
      },
      skip: (followListPagerble.page - 1) * followListPagerble.take,
      take: followListPagerble.take,
    });

    console.log('followList: ', followList);

    let userList = followList.map((elem) => {
      return {
        idx: elem.follower.idx,
        email: elem.follower.email,
        nickname: elem.follower.nickname,
        profile: elem.follower.profile,
        profileImg: elem.follower.profileImgTb[0].imgPath,
        isFollowing: false,
      };
    });

    if (loginUser) {
      userList = await Promise.all(
        userList.map(async (elem) => {
          const isFollowing = await this.getFollowStatus(
            loginUser.idx,
            elem.idx,
          );
          return { ...elem, isFollowing };
        }),
      );
    }
    console.log('userList', userList);

    return {
      totalCount: getFollowerCount,
      followList: userList.map((elem) => new UserEntity(elem)),
    };
  }
}
