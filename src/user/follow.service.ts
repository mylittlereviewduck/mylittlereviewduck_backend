import { UserService } from 'src/user/user.service';
import { FollowCheckService } from './follow-check.service';
import { FollowEntity } from './entity/Follow.entity';
import { FollowListPagerble } from './dto/follow-list-pagerble';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { UserPagerbleDto } from './dto/user-pagerble.dto';

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
    userPagerbleDto: UserPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowingCount = await this.prismaService.followTb.count({
      where: {
        followerIdx: userPagerbleDto.accountIdx,
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
        followerIdx: userPagerbleDto.accountIdx,
      },
      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
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
      totalPage: Math.ceil(getFollowingCount / userPagerbleDto.size),
      users: userList.map((elem) => new UserEntity(elem)),
    };
  }

  //팔로워리스트 가져오기
  async getFollowerList(
    userPagerbleDto: UserPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowerCount = await this.prismaService.followTb.count({
      where: {
        followeeIdx: userPagerbleDto.accountIdx,
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
        followeeIdx: userPagerbleDto.accountIdx,
      },
      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
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
      totalPage: Math.ceil(getFollowerCount / userPagerbleDto.size),
      users: userList.map((elem) => new UserEntity(elem)),
    };
  }
}
