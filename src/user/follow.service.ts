import { FollowEntity } from './entity/Follow.entity';
import { FollowListPagerble } from './dto/follow-list-pagerble';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoginUser } from '../../src/auth/model/login-user.model';
import { FollowChecker } from './follow-checker.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly followChecker: FollowChecker,
  ) {}

  async followUser(
    loginUser: LoginUser,
    toUserIdx: number,
  ): Promise<FollowEntity> {
    console.log(loginUser.idx);
    console.log(toUserIdx);

    const existingFollow = await this.followChecker.isFollow(
      loginUser.idx,
      toUserIdx,
    );

    if (existingFollow) {
      throw new ConflictException('Already Followed');
    }

    const followEntity = await this.prismaService.followTb.create({
      data: {
        followerIdx: loginUser.idx,
        followeeIdx: toUserIdx,
      },
    });

    return followEntity;
  }

  async unfollowUser(loginUser: LoginUser, toUserIdx: number): Promise<void> {
    const existingFollow = await this.followChecker.isFollow(
      loginUser.idx,
      toUserIdx,
    );

    if (!existingFollow) {
      throw new ConflictException('Already Not Followed');
    }

    await this.prismaService.followTb.deleteMany({
      where: {
        followerIdx: loginUser.idx,
        followeeIdx: toUserIdx,
      },
    });
  }

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
          const isFollowing = await this.followChecker.isFollow(
            loginUser.idx,
            elem.idx,
          );

          return { ...elem, isFollowing: isFollowing != null };
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
          const isFollowing = await this.followChecker.isFollow(
            loginUser.idx,
            elem.idx,
          );
          return { ...elem, isFollowing: isFollowing != null };
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
