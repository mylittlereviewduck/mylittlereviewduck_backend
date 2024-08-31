import { UserService } from 'src/user/user.service';
import { FollowCheckService } from './follow-check.service';
import { FollowEntity } from './entity/Follow.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly followCheckService: FollowCheckService,
    private readonly userService: UserService,
  ) {}

  async followUser(userIdx: string, toUserIdx: string): Promise<FollowEntity> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (userIdx == toUserIdx) {
      throw new BadRequestException('Cannot Follow Myself');
    }

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingFollow = await this.prismaService.followTb.findUnique({
      where: {
        followerIdx_followeeIdx: {
          followerIdx: userIdx,
          followeeIdx: toUserIdx,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already Followed');
    }

    const followEntity = await this.prismaService.followTb.create({
      data: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });

    return followEntity;
  }

  async unfollowUser(userIdx: string, toUserIdx: string): Promise<void> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingFollow = await this.followCheckService.isFollow(userIdx, [
      user,
    ]);

    if (!existingFollow) {
      throw new ConflictException('Already Not Followed');
    }

    await this.prismaService.followTb.deleteMany({
      where: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });
  }

  // async getFollowingList(
  //   userPagerbleDto: UserPagerbleDto,
  // ): Promise<UserPagerbleResponseDto> {
  //   const getFollowingCount = await this.prismaService.followTb.count({
  //     where: {
  //       followerIdx: userPagerbleDto.userIdx,
  //     },
  //   });

  //   const followList = await this.prismaService.followTb.findMany({
  //     include: {
  //       followee: {
  //         include: {
  //           profileImgTb: true,
  //           _count: {
  //             select: {
  //               followee: true,
  //               follower: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //     where: {
  //       followerIdx: userPagerbleDto.userIdx,
  //     },
  //     skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
  //     take: userPagerbleDto.size,
  //   });

  // let userList = followList.map((elem) => {
  //   return {
  //     idx: elem.followee.idx,
  //     email: elem.followee.email,
  //     nickname: elem.followee.nickname,
  //     profile: elem.followee.profile,
  //     profileImg: elem.followee.profileImgTb[0].imgPath,
  //     createdAt: elem.createdAt,
  //   };
  // });

  //   return {
  //     totalPage: Math.ceil(getFollowingCount / userPagerbleDto.size),
  //     users: followList.map((elem) => new UserEntity(elem)),
  //   };
  // }

  // async getFollowerList(
  //   userPagerbleDto: UserPagerbleDto,
  // ): Promise<UserPagerbleResponseDto> {
  //   const getFollowerCount = await this.prismaService.followTb.count({
  //     where: {
  //       followeeIdx: userPagerbleDto.userIdx,
  //     },
  //   });

  //   const followList = await this.prismaService.followTb.findMany({
  //     include: {
  //       follower: {
  //         include: {
  //           profileImgTb: {
  //             select: {
  //               imgPath: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //     where: {
  //       followeeIdx: userPagerbleDto.userIdx,
  //     },
  //     skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
  //     take: userPagerbleDto.size,
  //   });

  //   let userList = followList.map((elem) => {
  //     return {
  //       idx: elem.follower.idx,
  //       email: elem.follower.email,
  //       nickname: elem.follower.nickname,
  //       profile: elem.follower.profile,
  //       profileImg: elem.follower.profileImgTb[0].imgPath,
  //       createdAt: elem.createdAt,
  //     };
  //   });

  //   return {
  //     totalPage: Math.ceil(getFollowerCount / userPagerbleDto.size),
  //     users: userList.map((elem) => new UserEntity(elem)),
  //   };
  // }
}
