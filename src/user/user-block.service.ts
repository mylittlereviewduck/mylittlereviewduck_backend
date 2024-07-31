import { ConflictException, Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserBlockChecker } from './user-block-checker.service';
import { UserBlockEntity } from './entity/Block.entity';
import { UserEntity } from './entity/User.entity';
import { UserBlockPagerble } from './dto/user-block-pagerble';

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

  // 차단기능을 결국 어떻게 적용할건지?(차단한 유저의 댓글, 차단한 유저의 리뷰 => 유저엔티티에 isBlocked를 추가해야겠지?)
  async getBlockedUserAll(
    userIdx: number,
    blockPagerble: UserBlockPagerble,
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
      skip: (blockPagerble.page - 1) * blockPagerble.take,
      take: blockPagerble.take,
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

    return blockedUserList.map((elem) => new UserEntity(elem));
  }
}
