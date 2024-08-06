import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async reportReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == accountIdx) {
      throw new ConflictException("Can't report my review");
    }

    const existingReport = await this.prismaService.reviewReportTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingReport) {
      throw new ConflictException('Already Review Reported');
    }

    await this.prismaService.reviewReportTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unreportReview(accountIdx: number, reviewIdx: number): Promise<void> {
    console.log('삭제시작');
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == accountIdx) {
      throw new ConflictException("Can't report my review");
    }

    const existingReport = await this.prismaService.reviewReportTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingReport) {
      throw new ConflictException('Already Not Review Reported');
    }

    await this.prismaService.reviewReportTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
