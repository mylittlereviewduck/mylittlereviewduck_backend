import { UserPagerbleDto } from './dto/user-pagerble.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/User.entity';
import { UserBlockCheckService } from './user-block-check.service';
import { UserService } from './user.service';
import { UserBlockEntity } from './entity/UserBlock.entity';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly userBlockCheckService: UserBlockCheckService,
  ) {}

  async blockUser(
    userIdx: string,
    toUserIdx: string,
  ): Promise<UserBlockEntity> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingBlock = await this.userBlockCheckService.isBlocked(userIdx, [
      user,
    ]);

    if (user.isBlocked == true) {
      throw new ConflictException('Already Conflict');
    }

    const userBlockData = await this.prismaService.accountBlockTb.create({
      data: {
        blockerIdx: userIdx,
        blockedIdx: toUserIdx,
      },
    });

    return new UserBlockEntity(userBlockData);
  }

  async unBlockUser(userIdx: string, toUserIdx: string): Promise<void> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingBlock = await this.userBlockCheckService.isBlocked(userIdx, [
      user,
    ]);

    if (user.isBlocked == false) {
      throw new ConflictException('Already Not Conflict');
    }

    await this.prismaService.accountBlockTb.deleteMany({
      where: {
        blockerIdx: userIdx,
        blockedIdx: toUserIdx,
      },
    });

    return;
  }

  async getBlockedUserAll(
    userIdx: string,
    userPagerbleDto: UserPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const totalCount = await this.prismaService.accountBlockTb.count({
      where: {
        blockerIdx: userIdx,
      },
    });

    const blockedList = await this.prismaService.accountBlockTb.findMany({
      include: {
        blocked: {
          include: {
            profileImgTb: true,
            _count: {
              select: {
                follower: true,
                followee: true,
                reviewReportTb: true,
              },
            },
          },
        },
      },
      where: {
        blockerIdx: userIdx,
      },
      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
    });

    let blockedUserList = blockedList.map((elem) => {
      return {
        ...elem.blocked,
        followingCount: elem.blocked._count.follower,
        followerCount: elem.blocked._count.followee,
        isBlocked: true,
      };
    });

    return {
      totalPage: Math.ceil(totalCount / userPagerbleDto.size),
      users: blockedUserList.map((elem) => new UserEntity(elem)),
    };
  }
}
