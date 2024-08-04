import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class ReviewLikeCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  //리뷰 리스트형태로도 받을수 있어야함
  async isReviewLiked(
    accountIdx: number,
    reviewIdx: number[],
  ): Promise<boolean> {
    console.log('accountIdx,', accountIdx);
    console.log('reviewIdx,', reviewIdx);

    const sqlResult = await this.prismaService.reviewLikesTb.findMany({
      where: {
        accountIdx: accountIdx,
        reviewIdx: {
          in: reviewIdx,
        },
      },
      // select: {
      //   reviewIdx: true,
      // },
    });

    console.log('ReviewLike SQL result: ', sqlResult);

    return;
  }
}
