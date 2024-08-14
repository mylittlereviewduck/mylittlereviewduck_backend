import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from './review.service';

@Injectable()
export class ReviewBookmarkService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async bookmarkReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingBookmark =
      await this.prismaService.reviewBookmarkTb.findFirst({
        where: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      });

    if (existingBookmark) {
      throw new ConflictException('Already Bookmark');
    }

    await this.prismaService.reviewBookmarkTb.create({
      data: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unbookmarkReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingBookmark =
      await this.prismaService.reviewBookmarkTb.findFirst({
        where: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      });

    if (!existingBookmark) {
      throw new ConflictException('Already Not Bookmark');
    }

    await this.prismaService.reviewBookmarkTb.delete({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
