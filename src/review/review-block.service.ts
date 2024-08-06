import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewBlockService {
  constructor(private readonly prismaService: PrismaService) {}

  async blockReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx == accountIdx) {
      throw new ConflictException("Can't block my review");
    }

    const existingBlock = await this.prismaService.reviewBlockTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingBlock) {
      throw new ConflictException('Already Blocked');
    }

    await this.prismaService.reviewBlockTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unblockReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingBlock = await this.prismaService.reviewBlockTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingBlock) {
      throw new ConflictException('Already Not Blocked');
    }

    await this.prismaService.reviewBlockTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
