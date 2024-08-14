import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from './review.service';

@Injectable()
export class ReviewReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async reportReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == userIdx) {
      throw new ConflictException("Can't Report My Review");
    }

    const existingReport = await this.prismaService.reviewReportTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingReport) {
      throw new ConflictException('Already Review Reported');
    }

    await this.prismaService.reviewReportTb.create({
      data: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unreportReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == userIdx) {
      throw new ConflictException("Can't Report My Review");
    }

    const existingReport = await this.prismaService.reviewReportTb.findFirst({
      where: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingReport) {
      throw new ConflictException('Already Not Review Reported');
    }

    await this.prismaService.reviewReportTb.delete({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
