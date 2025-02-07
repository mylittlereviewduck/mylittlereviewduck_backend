import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';
import { GetReviewsDto } from './dto/request/get-reviews.dto';

@Injectable()
export class ReviewLikeCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isReviewLiked(
    userIdx: string,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewLikeTb.findMany({
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

    const likedReviewIdxList = sqlResult.map((elem) => elem.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (likedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyLike = true;
      } else {
        reviews[i].isMyLike = false;
      }
    }

    return reviews;
  }

  async isReviewDisliked(
    userIdx: string,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewDislikeTb.findMany({
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

    const dislikedReviewIdxList = sqlResult.map((elem) => elem.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (dislikedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyDislike = true;
      } else {
        reviews[i].isMyDislike = false;
      }
    }

    return reviews;
  }

  async getLikedReviewsIdx(
    dto: GetReviewsDto,
  ): Promise<{ totalCount: number; reviewIdxs: number[] }> {
    const totalCount = await this.prismaService.reviewLikeTb.count({
      where: { accountIdx: dto.userIdx },
    });

    const likedReviewIdxs = await this.prismaService.reviewLikeTb.findMany({
      where: { accountIdx: dto.userIdx },
      orderBy: {
        createdAt: 'desc',
      },
      select: { reviewIdx: true },
      ...(dto.page && { skip: (dto.page - 1) * dto.size }),
      ...(dto.size && { take: dto.size }),
    });

    return {
      totalCount,
      reviewIdxs: likedReviewIdxs.map((elem) => elem.reviewIdx),
    };
  }
}
