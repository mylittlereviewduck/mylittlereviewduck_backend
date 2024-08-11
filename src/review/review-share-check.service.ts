import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class ReviewShareCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isReviewShared(
    accountIdx: number,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewShareTb.findMany({
      where: {
        accountIdx: accountIdx,
        reviewIdx: {
          in: reviews.map((review) => review.idx),
        },
      },
      select: {
        reviewIdx: true,
      },
    });

    const sharedReviewIdxList = sqlResult.map((elem) => elem.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (sharedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyShare = true;
      }
    }

    return reviews;
  }
}
