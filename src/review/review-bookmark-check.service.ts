import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class ReviewBookmarkCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isReviewBookmarked(
    accountIdx: number,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewBookmarkTb.findMany({
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

    const bookmarkedReviewIdxList = sqlResult.map((review) => review.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (bookmarkedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyBookmark = true;
      }
    }

    return reviews;
  }
}
