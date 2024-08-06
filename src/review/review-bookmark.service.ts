import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewBookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  async bookmarkReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const existingBookmark = await this.prismaService.bookmarkTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Already Bookmark');
    }

    await this.prismaService.bookmarkTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }

  async unBookmarkReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const existingBookmark = await this.prismaService.bookmarkTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!existingBookmark) {
      throw new ConflictException('Already Not Bookmark');
    }

    await this.prismaService.bookmarkTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: accountIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
