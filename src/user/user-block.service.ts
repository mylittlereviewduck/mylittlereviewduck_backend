import { UserPagerbleDto } from './dto/user-pagerble.dto';
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
      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
    });

    let blockedUserList = blockedList.map((elem) => {
      return {
        ...elem.blocked,
        followingCount: elem.blocked._count.followers,
        followerCount: elem.blocked._count.followings,
        isBlocked: true,
      };
    });

    return {
      totalPage: Math.ceil(totalCount / userPagerbleDto.size),
      users: blockedUserList.map((elem) => new UserEntity(elem)),
    };
  }
}
