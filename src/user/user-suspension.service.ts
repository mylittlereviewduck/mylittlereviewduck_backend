import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { UserEntity } from './entity/User.entity';
import { SuspendUserDto } from './dto/suspend-user.dto';

@Injectable()
export class UserSuspensionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async suspendUser(dto: SuspendUserDto): Promise<UserEntity> {
    const user = await this.userService.getUser({
      idx: dto.userIdx,
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
    if (dto.timeframe == '7D') {
      // 7일정지
      plusSuspendPeriod = 7 * 24 * 60 * 60 * 1000;
    } else if (dto.timeframe == '1M') {
      // 한달정지
      plusSuspendPeriod = 30 * 24 * 60 * 60 * 1000;
    } else if (dto.timeframe == 'blackList') {
      //100년정지
      plusSuspendPeriod = 100 * 365 * 24 * 60 * 60 * 1000;
    }

    const suspendedUser = await this.prismaService.accountTb.update({
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
      data: {
        suspensionCount: user.suspensionCount + 1,
        suspendExpireAt: new Date(
          existingSuspendPeriod.getTime() + plusSuspendPeriod,
        ),
      },
      where: {
        idx: dto.userIdx,
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
