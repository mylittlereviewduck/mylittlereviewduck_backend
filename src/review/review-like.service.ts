import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from './review.service';

@Injectable()
export class ReviewLikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async likeReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewWithIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.prismaService.reviewLikesTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingLike) {
      throw new ConflictException('Already Review Like');
    }

    await this.prismaService.reviewLikesTb.create({
      data: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unlikeReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewWithIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.prismaService.reviewLikesTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingLike) {
      throw new ConflictException('Already Not Review Like');
    }

    await this.prismaService.reviewLikesTb.delete({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
