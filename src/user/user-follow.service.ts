import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/User.entity';
import { NotificationUserEntity } from 'src/notification/entity/NotificationUser.entity';
import { GetFollowUserDto } from './dto/user-follow-pagerble.dto';

@Injectable()
export class UserFollowService {
  constructor(private readonly prismaService: PrismaService) {}

  async isFollow(
    accountIdx: string,
    toUsers: UserEntity[] | NotificationUserEntity[],
  ): Promise<UserEntity[] | NotificationUserEntity[]> {
    const sqlResult = await this.prismaService.followTb.findMany({
      select: {
        followee: true,
      },
      where: {
        followerIdx: accountIdx,
        followeeIdx: {
          in: toUsers.map((elem) => elem.idx),
        },
      },
    });

    const followingUserList = sqlResult.map((elem) => elem.followee.idx);

    for (let i = 0; i < toUsers.length; i++) {
      if (followingUserList.includes(toUsers[i].idx)) {
        toUsers[i].isMyFollowing = true;
      } else {
        toUsers[i].isMyFollowing = false;
      }
    }

    return toUsers;
  }

  async getFollowingUsersIdx(
    dto: GetFollowUserDto,
  ): Promise<{ followingIdxs: string[]; totalCount: number }> {
    const totalCount = await this.prismaService.followTb.count({
      where: { followerIdx: dto.userIdx },
    });

    const followList = await this.prismaService.followTb.findMany({
      where: { followerIdx: dto.userIdx },
      select: { followeeIdx: true },
      ...(dto.page && { skip: (dto.page - 1) * dto.size }),
      ...(dto.size && { take: dto.size }),
    });

    return {
      followingIdxs: followList.map((follow) => follow.followeeIdx),
      totalCount,
    };
  }

  async getFollowerUsersIdx(
    dto: GetFollowUserDto,
  ): Promise<{ followerIdxs: string[]; totalCount: number }> {
    const totalCount = await this.prismaService.followTb.count({
      where: { followeeIdx: dto.userIdx },
    });

    const followeeList = await this.prismaService.followTb.findMany({
      where: { followeeIdx: dto.userIdx },
      select: { followerIdx: true },
      ...(dto.page && { skip: (dto.page - 1) * dto.size }),
      ...(dto.size && { take: dto.size }),
    });

    return {
      followerIdxs: followeeList.map((follow) => follow.followerIdx),
      totalCount,
    };
  }
}
