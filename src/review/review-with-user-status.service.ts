import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { UserStatus } from './type/user-status';

@Injectable()
export class ReviewWithUserStatusService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserStatus(
    loginUserIdx: string,
    reviewIdxs: number[],
    tx: PrismaClient,
  ): Promise<UserStatus[]> {
    const prismaService = tx || this.prismaService;

    const statuses = await prismaService.$queryRaw<UserStatus[]>`
    SELECT
        r.idx AS "reviewIdx",
        l.review_idx IS NOT NULL AS "isMyLike",
        dl.review_idx IS NOT NULL AS "isMyDislike",
        rb.review_idx IS NOT NULL AS "isMyBookmark",
        bl.review_idx IS NOT NULL AS "isMyBlock"
    FROM
        review_tb r
    LEFT JOIN review_like_tb l
        ON r.idx = l.review_idx AND l.account_idx = ${loginUserIdx}
    LEFT JOIN review_dislike_tb dl
        ON r.idx = dl.review_idx AND dl.account_idx = ${loginUserIdx}
    LEFT JOIN review_bookmark_tb rb
        ON r.idx = rb.review_idx AND rb.account_idx = ${loginUserIdx}
    LEFT JOIN review_block_tb bl
        ON r.idx = bl.review_idx AND bl.account_idx = ${loginUserIdx}
    WHERE
        r.idx IN (${Prisma.join(reviewIdxs)});
  `;

    return statuses;
  }
}
