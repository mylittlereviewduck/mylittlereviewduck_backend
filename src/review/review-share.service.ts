import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewShareService {
  constructor(private readonly prismaService: PrismaService) {}

  async shareReview(accountIdx: number, reviewIdx: number): Promise<void> {
    const existingShare = await this.prismaService.reviewShareTb.findFirst({
      where: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (existingShare) {
      return;
    }

    await this.prismaService.reviewShareTb.create({
      data: {
        accountIdx: accountIdx,
        reviewIdx: reviewIdx,
      },
    });
  }
}
