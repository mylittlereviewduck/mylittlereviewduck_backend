import {
  BadRequestException,
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
import { PagerbleDto } from './dto/pagerble.dto';

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
    if (userIdx == toUserIdx) {
      throw new BadRequestException('Cannot Block Myself');
    }

    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    await this.userBlockCheckService.isBlockedUser(userIdx, [user]);

    if (user.isMyBlock == true) {
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

    await this.userBlockCheckService.isBlockedUser(userIdx, [user]);

    if (user.isMyBlock == false) {
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
    dto: PagerbleDto,
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
            _count: {
              select: {
                followers: true,
                followings: true,
                reviewTb: true,
              },
            },
          },
        },
      },
      where: {
        blockerIdx: userIdx,
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    let blockedUserList = blockedList.map((elem) => {
      return {
        ...elem.blocked,
        followingCount: elem.blocked._count.followings,
        followerCount: elem.blocked._count.followers,
        isBlocked: true,
      };
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      users: blockedUserList.map((elem) => new UserEntity(elem)),
    };
  }
}
