import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewPagerbleDto } from './dto/review-pagerble.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { LoginUser } from 'src/auth/model/login-user.model';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewSearchPagerbleDto } from './dto/review-search-pagerble.dto';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { ReviewSearchResponseDto } from './dto/response/review-search-response.dto';
import { ReviewLikeCheckService } from './review-like-check.service';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly reviewLikeCheckService: ReviewLikeCheckService,
  ) {}

  async createReview(
    loginUser: LoginUser,
    createDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    let reviewData;

    await this.prismaService.$transaction(async (tx) => {
      reviewData = await tx.reviewTb.create({
        data: {
          accountIdx: loginUser.idx,
          title: createDto.title,
          content: createDto.content,
          score: createDto.score,
        },
      });

      await tx.tagTb.createMany({
        data: createDto.tags.map((tag) => {
          return {
            reviewIdx: reviewData.idx,
            tagName: tag,
          };
        }),
      });
    });

    const reviewEntityData = { ...reviewData, tags: createDto.tags };

    return new ReviewEntity(reviewEntityData);
  }

  async updateReview(
    loginUser: LoginUser,
    reviewIdx: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    let reviewData;
    let tagData;

    await this.prismaService.$transaction(async (tx) => {
      const review = await tx.reviewTb.findUnique({
        where: {
          idx: reviewIdx,
        },
      });

      if (!review) {
        throw new NotFoundException('Not Found Review');
      }

      if (review.accountIdx !== loginUser.idx) {
        throw new UnauthorizedException('Unauthorized User');
      }
      reviewData = await tx.reviewTb.update({
        include: {
          tagTb: {
            select: {
              tagName: true,
            },
          },
          _count: {
            select: {
              reviewLikesTb: true,
              reviewBookmarkTb: true,
              reviewShareTb: true,
              reviewReportTb: true,
            },
          },
        },
        data: {
          title: updateReviewDto.title,
          score: updateReviewDto.score,
          content: updateReviewDto.content,
        },
        where: {
          idx: reviewIdx,
        },
      });

      await tx.tagTb.deleteMany({
        where: {
          reviewIdx: reviewIdx,
        },
      });

      await tx.tagTb.createMany({
        data: updateReviewDto.tags.map((tag) => {
          return {
            reviewIdx: reviewIdx,
            tagName: tag,
          };
        }),
      });

      tagData = await tx.tagTb.findMany({
        where: {
          reviewIdx: reviewIdx,
        },
        select: {
          tagName: true,
        },
      });
    });

    const review = {
      ...reviewData,
      tags: tagData.map((tag) => tag.tagName),
      likeCount: reviewData._count.reviewLikesTb,
      bookmarkCount: reviewData._count.reviewBookmarkTb,
      shareCount: reviewData._count.reviewShareTb,
      reportCount: reviewData._count.reviewReportTb,
    };

    return new ReviewEntity(review);
  }

  async deleteReview(
    loginUser: LoginUser,
    reviewIdx: number,
  ): Promise<ReviewEntity> {
    const review = await this.prismaService.reviewTb.findUnique({
      where: { idx: reviewIdx },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.accountIdx !== loginUser.idx) {
      throw new UnauthorizedException('Unauthorized User');
    }

    const deletedReview = await this.prismaService.reviewTb.delete({
      where: {
        idx: reviewIdx,
      },
    });

    return new ReviewEntity(deletedReview);
  }

  async getReviewWithIdx(reviewIdx: number): Promise<ReviewEntity> {
    let reviewData;

    await this.prismaService.$transaction(async (tx) => {
      reviewData = await tx.reviewTb.findFirst({
        include: {
          tagTb: {
            select: {
              tagName: true,
            },
          },
          _count: {
            select: {
              reviewLikesTb: true,
              reviewBookmarkTb: true,
              reviewReportTb: true,
              reviewShareTb: true,
            },
          },
        },
        where: {
          idx: reviewIdx,
        },
      });

      await tx.reviewTb.update({
        data: {
          viewCount: reviewData.viewCount + 1,
        },
        where: {
          idx: reviewIdx,
        },
      });
    });

    if (!reviewData) {
      throw new NotFoundException('Not Found Review');
    }

    const review = {
      ...reviewData,
      tags: reviewData.tagTb.map((tag) => tag.tagName),
      viewCount: reviewData.viewCount + 1,
      likeCount: reviewData._count.reviewLikesTb,
      bookmarkCount: reviewData._count.reviewBookmarkTb,
      shareCount: reviewData._count.reviewShareTb,
      reportCount: reviewData._count.reviewReportTb,
    };

    return new ReviewEntity(review);
  }

  async getReviews(
    reviewPagerbleDto: ReviewPagerbleDto,
    accountIdx?: number,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewCount = await this.prismaService.reviewTb.count({
      where: accountIdx
        ? {
            accountIdx: accountIdx,
            deletedAt: null,
          }
        : {},
    });

    const reviewSQLResult = await this.prismaService.reviewTb.findMany({
      include: {
        tagTb: {
          select: {
            tagName: true,
          },
        },
        _count: {
          select: {
            reviewLikesTb: true,
            reviewBookmarkTb: true,
            reviewShareTb: true,
            reviewReportTb: true,
          },
        },
      },
      where: accountIdx ? { accountIdx: accountIdx } : {},
      orderBy: {
        idx: 'desc',
      },
      take: reviewPagerbleDto.size,
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
    });

    const reviewData = reviewSQLResult.map((elem) => {
      return {
        ...elem,
        tags: elem.tagTb.map((elem) => elem.tagName),
        likeCount: elem._count.reviewLikesTb,
        bookmarkCount: elem._count.reviewBookmarkTb,
        shareCount: elem._count.reviewShareTb,
        reportCount: elem._count.reviewReportTb,
      };
    });

    return {
      totalPage: Math.ceil(reviewCount / reviewPagerbleDto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
    };
  }

  async getReviewWithSearch(
    reviewSearchPagerbleDto: ReviewSearchPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        OR: [
          {
            title: {
              contains: reviewSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: reviewSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            accountTb: {
              nickname: {
                contains: reviewSearchPagerbleDto.search,
                mode: 'insensitive',
              },
            },
          },
          {
            tagTb: {
              some: {
                tagName: {
                  contains: reviewSearchPagerbleDto.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalCount / reviewSearchPagerbleDto.size);

    if (reviewSearchPagerbleDto.page > totalPage) {
      throw new NotFoundException('Not Found Page');
    }

    const searchSQLResult = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: true,
        tagTb: {
          select: {
            tagName: true,
          },
        },
        _count: {
          select: {
            reviewLikesTb: true,
          },
        },
      },
      where: {
        OR: [
          {
            title: {
              contains: reviewSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: reviewSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            accountTb: {
              nickname: {
                contains: reviewSearchPagerbleDto.search,
                mode: 'insensitive',
              },
            },
          },
          {
            tagTb: {
              some: {
                tagName: {
                  contains: reviewSearchPagerbleDto.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
      orderBy: {
        idx: 'desc',
      },
      take: reviewSearchPagerbleDto.size,
      skip: reviewSearchPagerbleDto.size * (reviewSearchPagerbleDto.page - 1),
    });

    const reviewData = searchSQLResult.map((review) => {
      return {
        ...review,
        likeCount: review._count.reviewLikesTb,
        tags: review.tagTb.map((elem) => elem.tagName),
      };
    });

    return {
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
      totalPage: Math.ceil(totalCount / reviewSearchPagerbleDto.size),
    };
  }

  async getBookmarkedReviewAll(
    accountIdx: number,
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        reviewBookmarkTb: {
          every: {
            accountIdx: accountIdx,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        tagTb: {
          select: {
            tagName: true,
          },
        },
        _count: {
          select: {
            reviewLikesTb: true,
            reviewBookmarkTb: true,
            reviewShareTb: true,
            reviewReportTb: true,
          },
        },
      },
      where: {
        reviewBookmarkTb: {
          every: {
            accountIdx: accountIdx,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
      take: reviewPagerbleDto.size,
    });

    const reviews = reviewData.map((elem) => {
      return {
        ...elem,
        tags: elem.tagTb.map((elem) => elem.tagName),
        likeCount: elem._count.reviewLikesTb,
        bookmarkCount: elem._count.reviewBookmarkTb,
        shareCount: elem._count.reviewShareTb,
        reportCount: elem._count.reviewReportTb,
      };
    });

    return {
      totalPage: Math.ceil(totalCount / reviewPagerbleDto.size),
      reviews: reviews.map((elem) => new ReviewEntity(elem)),
    };
  }

  async getHotReviewAll(): Promise<ReviewEntity[]> {
    const mostRecentNoon = this.getMostRecentNoon();

    const reviewList = await this.prismaService.reviewTb.findMany({
      include: {
        reviewLikesTb: {
          where: {
            createdAt: {
              gte: mostRecentNoon,
            },
          },
        },
      },
    });
    reviewList.sort((a, b) => b.reviewLikesTb.length - a.reviewLikesTb.length);

    return reviewList.map((elem) => new ReviewEntity(elem));
  }

  async getReviewCommented(
    reviewPagerbleDto: ReviewPagerbleDto,
    accountIdx: number,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        commentTb: {
          some: {
            accountIdx: accountIdx,
            deletedAt: null,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        tagTb: {
          select: {
            tagName: true,
          },
        },
        _count: {
          select: {
            reviewLikesTb: true,
            reviewBookmarkTb: true,
            reviewShareTb: true,
            reviewReportTb: true,
          },
        },
      },
      where: {
        commentTb: {
          some: {
            accountIdx: accountIdx,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
      take: reviewPagerbleDto.size,
    });

    const reviews = reviewData.map((elem) => {
      return {
        ...elem,
        tags: elem.tagTb.map((elem) => elem.tagName),
        likeCount: elem._count.reviewLikesTb,
        bookmarkCount: elem._count.reviewBookmarkTb,
        shareCount: elem._count.reviewShareTb,
        reportCount: elem._count.reviewReportTb,
      };
    });

    return {
      totalPage: Math.ceil(totalCount / reviewPagerbleDto.size),
      reviews: reviews.map((elem) => new ReviewEntity(elem)),
    };
  }

  getMostRecentNoon(): Date {
    const now = new Date();
    const noon = new Date(now);

    // 현재 시간이 12시 이후인지 확인
    if (now.getHours() >= 12) {
      // 오늘 12시 정각으로 설정
      noon.setHours(12, 0, 0, 0);
    } else {
      // 어제 12시 정각으로 설정
      noon.setDate(noon.getDate() - 1);
      noon.setHours(12, 0, 0, 0);
    }

    return noon;
  }
}
