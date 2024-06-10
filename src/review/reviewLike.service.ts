import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewLikeService {
  constructor(private readonly prismaService: PrismaService) {}

  getReviewAllLiked: (userIdx: number) => Promise<ReviewEntity[]> = async (
    userIdx,
  ) => {
    const reviewData = await this.prismaService.reviewLikesTb.findMany({
      include: {
        reviewTb: true,
      },
      where: {
        accountIdx: userIdx,
      },
    });

    return reviewData.map((elem) => new ReviewEntity(elem));
  };

  getReviewAllOrderByLike: (userIdx: number) => Promise<ReviewEntity[]>;

  likeReview: (userIdx: number, reviewIdx: number) => Promise<void>;

  unlikeReview: (userIdx: number, reviewIdx: number) => Promise<void>;

  isReviewLiked: (userIdx: number, reviewIdx: number) => Promise<boolean>;
}
