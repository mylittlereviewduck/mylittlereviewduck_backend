import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewBlockCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isReviewBlocked(
    userIdx: string,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewBlockTb.findMany({
      where: {
        accountIdx: userIdx,
        reviewIdx: {
          in: reviews.map((review) => review.idx),
        },
      },
      select: {
        reviewIdx: true,
      },
    });

    const blockedReviewIdxList = sqlResult.map((elem) => elem.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (blockedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyBlock = true;
      } else {
        reviews[i].isMyBlock = false;
      }
    }

    return reviews;
  }
}
