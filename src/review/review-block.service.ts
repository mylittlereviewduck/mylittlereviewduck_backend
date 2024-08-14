import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from './review.service';

@Injectable()
export class ReviewBlockService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async blockReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == userIdx) {
      throw new ConflictException("Can't block my review");
    }

    const existingBlock = await this.prismaService.reviewBlockTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingBlock) {
      throw new ConflictException('Already Blocked');
    }

    await this.prismaService.reviewBlockTb.create({
      data: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unblockReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == userIdx) {
      throw new ConflictException("Can't block my review");
    }

    const existingBlock = await this.prismaService.reviewBlockTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingBlock) {
      throw new ConflictException('Already Not Blocked');
    }

    await this.prismaService.reviewBlockTb.delete({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
