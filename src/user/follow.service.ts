import { UserService } from 'src/user/user.service';
import { FollowCheckService } from './follow-checker.service';
import { FollowEntity } from './entity/Follow.entity';
import { FollowListPagerble } from './dto/follow-list-pagerble';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoginUser } from '../../src/auth/model/login-user.model';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';

@Injectable()
export class FollowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly followCheckService: FollowCheckService,
    private readonly userService: UserService,
  ) {}

  async followUser(
    accountIdx: number,
    toAccountIdx: number,
  ): Promise<FollowEntity> {
    //존재하는 유저인지 적용

    const user = await this.userService.getUser({ idx: toAccountIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingFollow = await this.followCheckService.isFollow(accountIdx, [
      user,
    ]);

    if (existingFollow) {
      throw new ConflictException('Already Followed');
    }

    const followEntity = await this.prismaService.followTb.create({
      data: {
        followerIdx: accountIdx,
        followeeIdx: toAccountIdx,
      },
    });

    return followEntity;
  }

  async unfollowUser(accountIdx: number, toAccountIdx: number): Promise<void> {
    const user = await this.userService.getUser({ idx: toAccountIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingFollow = await this.followCheckService.isFollow(accountIdx, [
      user,
    ]);

    if (!existingFollow) {
      throw new ConflictException('Already Not Followed');
    }

    await this.prismaService.followTb.deleteMany({
      where: {
        followerIdx: accountIdx,
        followeeIdx: toAccountIdx,
      },
    });
  }

  async getFollowingList(
    followListPagerble: FollowListPagerble,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowingCount = await this.prismaService.followTb.count({
      where: {
        followerIdx: followListPagerble.accountIdx,
      },
    });

    const followList = await this.prismaService.followTb.findMany({
      include: {
        followee: {
          include: {
            profileImgTb: {
              select: {
                imgPath: true,
              },
            },
          },
        },
      },
      where: {
        followerIdx: followListPagerble.accountIdx,
      },
      skip: (followListPagerble.page - 1) * followListPagerble.size,
      take: followListPagerble.size,
    });

    let userList = followList.map((elem) => {
      return {
        idx: elem.followee.idx,
        email: elem.followee.email,
        nickname: elem.followee.nickname,
        profile: elem.followee.profile,
        profileImg: elem.followee.profileImgTb[0].imgPath,
        createdAt: elem.createdAt,
      };
    });

    return {
      totalPage: Math.ceil(getFollowingCount / followListPagerble.size),
      users: userList.map((elem) => new UserEntity(elem)),
    };
  }

  //팔로워리스트 가져오기
  async getFollowerList(
    followListPagerble: FollowListPagerble,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowerCount = await this.prismaService.followTb.count({
      where: {
        followeeIdx: followListPagerble.accountIdx,
      },
    });

    const followList = await this.prismaService.followTb.findMany({
      include: {
        follower: {
          include: {
            profileImgTb: {
              select: {
                imgPath: true,
              },
            },
          },
        },
      },
      where: {
        followeeIdx: followListPagerble.accountIdx,
      },
      skip: (followListPagerble.page - 1) * followListPagerble.size,
      take: followListPagerble.size,
    });

    let userList = followList.map((elem) => {
      return {
        idx: elem.follower.idx,
        email: elem.follower.email,
        nickname: elem.follower.nickname,
        profile: elem.follower.profile,
        profileImg: elem.follower.profileImgTb[0].imgPath,
        createdAt: elem.createdAt,
      };
    });

    return {
      totalPage: Math.ceil(getFollowerCount / followListPagerble.size),
      users: userList.map((elem) => new UserEntity(elem)),
    };
  }
}
