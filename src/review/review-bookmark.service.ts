import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { UserService } from 'src/user/user.service';
import { GetReviewsDto } from './dto/get-reviews.dto';

@Injectable()
export class ReviewBookmarkService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async isReviewBookmarked(
    userIdx: string,
    reviews: ReviewEntity[],
  ): Promise<ReviewEntity[]> {
    const sqlResult = await this.prismaService.reviewBookmarkTb.findMany({
      where: {
        accountIdx: userIdx,
        reviewIdx: {
          in: reviews.map((review) => review.idx),
        },
      },
      select: {
        reviewIdx: true,
      },
    });

    const bookmarkedReviewIdxList = sqlResult.map((review) => review.reviewIdx);

    for (let i = 0; i < reviews.length; i++) {
      if (bookmarkedReviewIdxList.includes(reviews[i].idx)) {
        reviews[i].isMyBookmark = true;
      } else {
        reviews[i].isMyBookmark = false;
      }
    }

    return reviews;
  }

  async getBookmarkedReviewAll(
    dto: GetReviewsDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const user = await this.userService.getUser({ idx: dto.userIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const totalCount = await this.prismaService.reviewBookmarkTb.count({
      where: {
        accountIdx: dto.userIdx,
      },
    });

    const reviewData = await this.prismaService.reviewBookmarkTb.findMany({
      include: {
        reviewTb: {
          include: {
            accountTb: true,
            tagTb: true,
            reviewImgTb: true,
            _count: {
              select: {
                commentTb: true,
                reviewLikeTb: true,
                reviewDislikeTb: true,
                reviewBookmarkTb: true,
              },
            },
          },
        },
      },
      where: {
        accountIdx: dto.userIdx,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem.reviewTb)),
    };
  }
}
