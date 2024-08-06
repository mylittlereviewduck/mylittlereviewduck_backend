import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewBookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  async bookmarkReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingBookmark =
      await this.prismaService.reviewBookmarkTb.findFirst({
        where: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      });

    if (existingBookmark) {
      throw new ConflictException('Already Bookmark');
    }

    await this.prismaService.reviewBookmarkTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unbookmarkReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const review = await this.prismaService.reviewTb.findFirst({
      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingBookmark =
      await this.prismaService.reviewBookmarkTb.findFirst({
        where: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      });

    if (!existingBookmark) {
      throw new ConflictException('Already Not Bookmark');
    }

    await this.prismaService.reviewBookmarkTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
