import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/User.entity';
import { ReviewListUserEntity } from 'src/review/entity/ReviewListUser.entity';

@Injectable()
export class UserBlockCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isBlockedUser(
    userIdx: string,
    toUsers: UserEntity[] | ReviewListUserEntity[],
  ): Promise<UserEntity[] | ReviewListUserEntity[]> {
    const sqlResult = await this.prismaService.accountBlockTb.findMany({
      select: {
        blockedIdx: true,
      },
      where: {
        blockerIdx: userIdx,
        blockedIdx: {
          in: toUsers.map((elem) => elem.idx),
        },
      },
    });

    const blockedUserList = sqlResult.map((elem) => elem.blockedIdx);

    console.log('함수실행');

    for (let i = 0; i < toUsers.length; i++) {
      if (blockedUserList.includes(toUsers[i].idx)) {
        toUsers[i].isMyBlock = true;
      } else {
        toUsers[i].isMyBlock = false;
      }
    }

    return toUsers;
  }
}
