import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewLikeService {
  constructor(private readonly prismaService: PrismaService) {}

  async likeReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.prismaService.reviewLikesTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingLike) {
      throw new ConflictException('Already Review Like');
    }

    await this.prismaService.reviewLikesTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unlikeReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.prismaService.reviewLikesTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingLike) {
      throw new ConflictException('Already Not Review Like');
    }

    await this.prismaService.reviewLikesTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
