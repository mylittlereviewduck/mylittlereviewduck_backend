import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/User.entity';

@Injectable()
export class UserBlockCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isBlocked(
    userIdx: string,
    toUsers: UserEntity[],
  ): Promise<UserEntity[]> {
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

    for (let i = 0; i < toUsers.length; i++) {
      if (blockedUserList.includes(toUsers[i].idx)) {
        toUsers[i].isMyBlock = true;
      }
    }

    return toUsers;
  }
}
