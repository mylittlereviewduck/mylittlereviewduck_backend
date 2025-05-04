import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entity/User.entity';
import { userSuspendPeriod } from '../user/dto/suspend-user.dto';

@Injectable()
export class UserSuspensionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async suspendUser(
    userIdx: string,
    timeframe: userSuspendPeriod,
  ): Promise<UserEntity> {
    const user = await this.userService.getUser({
      idx: userIdx,
    });

    //기존정지기간 없다면 현재시간
    let existingSuspendPeriod: Date;
    if (!user.suspendExpireAt) {
      existingSuspendPeriod = new Date();
    } else {
      existingSuspendPeriod = new Date(user.suspendExpireAt);
    }

    //추가될 정지기간
    let plusSuspendPeriod: number;
    if (timeframe == '7D') {
      //7일정지
      plusSuspendPeriod = 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe == '1M') {
      // 한달정지
      plusSuspendPeriod = 30 * 24 * 60 * 60 * 1000;
    } else if (timeframe == 'blackList') {
      //100년정지l
      plusSuspendPeriod = 100 * 365 * 24 * 60 * 60 * 1000;
    }

    const suspendedUser = await this.prismaService.accountTb.update({
      include: {
        _count: {
          select: {
            followers: true,
            followings: true,
            reviewTb: true,
          },
        },
      },
      data: {
        suspensionCount: user.suspensionCount + 1,
        suspendExpireAt: new Date(
          existingSuspendPeriod.getTime() + plusSuspendPeriod,
        ),
      },
      where: {
        idx: userIdx,
      },
    });

    return new UserEntity(suspendedUser);
  }

  async deleteUserSuspension(userIdx: string): Promise<void> {
    await this.prismaService.accountTb.update({
      data: {
        suspendExpireAt: null,
      },
      where: {
        idx: userIdx,
      },
    });
  }
}
