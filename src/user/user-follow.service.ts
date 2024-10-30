import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/User.entity';
import { NotificationUserEntity } from 'src/notification/entity/NotificationUser.entity';
import { UserFollowPagerbleDto } from './dto/user-follow-pagerble.dto';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';

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

  async getFollowingList(
    dto: UserFollowPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const followingCount = await this.prismaService.followTb.count({
      where: {
        [dto.type === 'follower' ? 'followerIdx' : 'followeeIdx']: dto.userIdx,
      },
    });

    const followList = await this.prismaService.followTb.findMany({
      include: {
        follower: {
          include: {
            profileImgTb: {
              where: {
                deletedAt: null,
              },
            },
            _count: {
              select: {
                follower: true,
                followee: true,
              },
            },
          },
        },
      },
      where: {
        [dto.type === 'follower' ? 'followerIdx' : 'followeeIdx']: dto.userIdx,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    // return;
    return {
      totalPage: Math.ceil(followingCount / dto.size),
      users: followList.map((elem) => new UserEntity(elem.follower)),
    };
  }
}
