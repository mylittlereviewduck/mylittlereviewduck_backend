import { ConflictException, Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserBlockChecker } from './user-block-checker.service';
import { UserBlockEntity } from './entity/Block.entity';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userBlockChecker: UserBlockChecker,
  ) {}

  async blockUser(
    loginUser: LoginUser,
    toUserIdx: number,
  ): Promise<UserBlockEntity> {
    const existingBlock = await this.userBlockChecker.isBlocked(
      loginUser.idx,
      toUserIdx,
    );

    if (existingBlock) {
      throw new ConflictException('Already Conflict');
    }

    const userBlockEntity = await this.prismaService.accountBlockTb.create({
      data: {
        blockerIdx: loginUser.idx,
        blockedIdx: toUserIdx,
      },
    });

    return userBlockEntity;
  }

  async unBlockUser(loginUser: LoginUser, toUserIdx: number): Promise<void> {
    const existingBlock = await this.userBlockChecker.isBlocked(
      loginUser.idx,
      toUserIdx,
    );

    if (!existingBlock) {
      throw new ConflictException('Already Not Conflict');
    }

    await this.prismaService.accountBlockTb.deleteMany({
      where: {
        blockerIdx: loginUser.idx,
        blockedIdx: toUserIdx,
      },
    });

    return;
  }

  getBlockedUserAll: (useIdx: number, 대상userIdx: number) => Promise<void>;
}
