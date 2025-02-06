import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInteraction } from './type/user-interaction.type';

@Injectable()
export class UserInteractionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserInteraction(
    loginUserIdx: string,
    userIdxs: string[],
    tx?: PrismaClient,
  ): Promise<UserInteraction[]> {
    const prismaService = tx ?? this.prismaService;

    const statuses = await prismaService.$queryRaw<UserInteraction[]>`
    SELECT
        a.idx AS "accountIdx",
        f.followee_idx IS NOT NULL AS "isMyFollowing",
        b.blocked_idx IS NOT NULL AS "isMyBlock",
    FROM
        account_tb a
    LEFT JOIN follow_tb f
        ON a.idx = f.follower_idx AND f.follower_idx = ${loginUserIdx}
    LEFT JOIN account_block_tb b
        ON a.idx = b.blocker_idx AND b.blocker_idx = ${loginUserIdx}
    WHERE
        r.idx IN (${Prisma.join(userIdxs)});
  `;

    return statuses;
  }
}
