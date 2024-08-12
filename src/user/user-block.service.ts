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

@Injectable()
export class UserBlockService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly userBlockCheckService: UserBlockCheckService,
  ) {}

  async blockUser(
    accountIdx: number,
    toAccountIdx: number,
  ): Promise<UserBlockEntity> {
    const user = await this.userService.getUser({ idx: toAccountIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingBlock = await this.userBlockCheckService.isBlocked(
      accountIdx,
      [user],
    );

    if (user.isBlocked == true) {
      throw new ConflictException('Already Conflict');
    }

    const userBlockData = await this.prismaService.accountBlockTb.create({
      data: {
        blockerIdx: accountIdx,
        blockedIdx: toAccountIdx,
      },
    });

    return new UserBlockEntity(userBlockData);
  }

  async unBlockUser(accountIdx: number, toUserIdx: number): Promise<void> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const existingBlock = await this.userBlockCheckService.isBlocked(
      accountIdx,
      [user],
    );

    if (user.isBlocked == false) {
      throw new ConflictException('Already Not Conflict');
    }

    await this.prismaService.accountBlockTb.deleteMany({
      where: {
        blockerIdx: accountIdx,
        blockedIdx: toUserIdx,
      },
    });

    return;
  }

  async getBlockedUserAll(
    userIdx: number,
    userPagerbleDto: UserPagerbleDto,
  ): Promise<UserEntity[]> {
    const blockedList = await this.prismaService.accountBlockTb.findMany({
      include: {
        blocked: {
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
        blockerIdx: userIdx,
      },
      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
    });

    let blockedUserList = blockedList.map((elem) => {
      return {
        idx: elem.blocked.idx,
        email: elem.blocked.email,
        nickname: elem.blocked.nickname,
        profile: elem.blocked.profile,
        profileImg: elem.blocked.profileImgTb[0].imgPath,
        isFollowing: false,
      };
    });

    return;
    // return blockedUserList.map((elem) => new UserEntity(elem));
  }
}
