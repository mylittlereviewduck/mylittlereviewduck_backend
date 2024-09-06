import {
  ConsoleLogger,
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
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewSearchPagerbleDto } from './dto/review-search-pagerble.dto';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { UserService } from 'src/user/user.service';
import { Cron } from '@nestjs/schedule';
import { ReviewListEntity } from './entity/ReviewList.entity';

@Injectable()
export class ReviewService {
  constructor(
    private readonly logger: ConsoleLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createReview(
    userIdx: string,
    createDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    let reviewData;

    reviewData = await this.prismaService.reviewTb.create({
      include: {
        accountTb: {
          include: {
            profileImgTb: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            reviewLikeTb: true,
            reviewDislikeTb: true,
            reviewBookmarkTb: true,
            reviewShareTb: true,
            commentTb: true,
          },
        },
      },

      data: {
        accountIdx: userIdx,
        title: createDto.title,
        content: createDto.content,
        score: createDto.score,
        tagTb: {
          createMany: {
            data: createDto.tags.map((tag) => {
              return {
                tagName: tag,
              };
            }),
          },
        },
        reviewImgTb: {
          createMany: {
            data: createDto.images.map((image, index) => ({
              imgPath: image,
              content: createDto.imgContent[index],
            })),
          },
        },
      },
    });

    return new ReviewEntity(reviewData);
  }

  async updateReview(
    userIdx: string,
    reviewIdx: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    let data;

    await this.prismaService.$transaction(async (tx) => {
      const review = await this.getReviewByIdx(reviewIdx);

      if (!review) {
        throw new NotFoundException('Not Found Review');
      }

      if (review.user.idx !== userIdx) {
        throw new UnauthorizedException('Unauthorized User');
      }

      data = await tx.reviewTb.update({
        include: {
          accountTb: {
            include: {
              profileImgTb: true,
            },
          },

          tagTb: true,
          reviewImgTb: {
            where: {
              deletedAt: null,
            },
          },
          _count: {
            select: {
              reviewLikeTb: true,
              reviewDislikeTb: true,
              reviewBookmarkTb: true,
              reviewShareTb: true,
              commentTb: true,
            },
          },
        },

        data: {
          title: updateReviewDto.title,
          score: updateReviewDto.score,
          content: updateReviewDto.content,
          updatedAt: new Date(),

          tagTb: {
            deleteMany: {
              reviewIdx: reviewIdx,
            },
            createMany: {
              data: updateReviewDto.tags.map((tag) => {
                return {
                  tagName: tag,
                };
              }),
            },
          },

          reviewImgTb: {
            updateMany: {
              data: {
                deletedAt: new Date(),
              },
              where: {
                reviewIdx: reviewIdx,
              },
            },

            createMany: {
              data: updateReviewDto.images.map((image, index) => ({
                imgPath: image,
                content: updateReviewDto.imgContent[index],
              })),
            },
          },
        },
        where: {
          idx: reviewIdx,
        },
      });
    });

    return new ReviewEntity(data);
  }

  async deleteReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    if (review.user.idx !== userIdx) {
      throw new UnauthorizedException('Unauthorized User');
    }

    await this.prismaService.reviewTb.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        idx: reviewIdx,
      },
    });
  }

  async getReviewByIdx(reviewIdx: number): Promise<ReviewEntity> {
    const existingReview = await this.prismaService.reviewTb.findUnique({
      where: {
        idx: reviewIdx,
      },
    });

    if (!existingReview) {
      return;
    }

    let reviewData = await this.prismaService.reviewTb.update({
      include: {
        accountTb: {
          include: {
            profileImgTb: {
              orderBy: {
                idx: 'desc',
              },
              take: 1,
            },
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },

        _count: {
          select: {
            commentTb: true,
            reviewLikeTb: true,
            reviewDislikeTb: true,
            reviewBookmarkTb: true,
            reviewReportTb: true,
            reviewShareTb: true,
          },
        },
      },
      data: {
        viewCount: existingReview.viewCount + 1,
      },

      where: {
        idx: reviewIdx,
      },
    });

    return new ReviewEntity(reviewData);
  }

  async getReviews(
    reviewPagerbleDto: ReviewPagerbleDto,
    userIdx?: string,
  ): Promise<ReviewPagerbleResponseDto> {
    if (userIdx) {
      const user = await this.userService.getUser({ idx: userIdx });

      if (!user) {
        throw new NotFoundException('Not Found User');
      }
    }

    const reviewCount = await this.prismaService.reviewTb.count({
      where: userIdx
        ? {
            accountIdx: userIdx,
            deletedAt: null,
          }
        : {},
    });

    const reviewSQLResult = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: {
              orderBy: {
                idx: 'desc',
              },
              take: 1,
            },
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },

        _count: {
          select: {
            commentTb: true,
            reviewLikeTb: true,
            reviewDislikeTb: true,
          },
        },
      },
      where: userIdx
        ? { accountIdx: userIdx, deletedAt: null }
        : { deletedAt: null },
      orderBy: {
        idx: 'desc',
      },
      take: reviewPagerbleDto.size,
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(reviewCount / reviewPagerbleDto.size),
      reviews: reviewSQLResult.map((elem) => new ReviewListEntity(elem)),
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
        deletedAt: null,
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            reviewLikeTb: true,
            reviewDislikeTb: true,
            commentTb: true,
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
        deletedAt: null,
      },
      orderBy: {
        idx: 'desc',
      },
      take: reviewSearchPagerbleDto.size,
      skip: reviewSearchPagerbleDto.size * (reviewSearchPagerbleDto.page - 1),
    });

    return {
      totalPage: Math.ceil(totalCount / reviewSearchPagerbleDto.size),
      reviews: reviewData.map((elem) => new ReviewListEntity(elem)),
    };
  }

  async getBookmarkedReviewAll(
    userIdx: string,
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const user = await this.userService.getUser({ idx: userIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        reviewBookmarkTb: {
          every: {
            accountIdx: userIdx,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            reviewLikeTb: true,
            reviewDislikeTb: true,
            commentTb: true,
          },
        },
      },
      where: {
        reviewBookmarkTb: {
          every: {
            accountIdx: userIdx,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
      take: reviewPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / reviewPagerbleDto.size),
      reviews: reviewData.map((elem) => new ReviewListEntity(elem)),
    };
  }

  // 700ms, 460ms 소요(캐싱, 인덱스 안했을경우)
  // (인덱싱 했을경우)
  // 메모리에 저장하는 함수, 12시간마다 실행되는 함수
  @Cron(' 0 0 0,12 * * *')
  async setHotReviewAll(): Promise<void> {
    const mostRecentNoon = this.getMostRecentNoon();

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            commentTb: true,
            reviewLikeTb: true,
            reviewDislikeTb: true,
          },
        },
      },
      where: {
        reviewLikeTb: {
          some: {
            createdAt: {
              // 12시간마다 업데이트 버전
              // gte: new Date(mostRecentNoon.getTime() - 12 * 60 * 60 * 1000),
              // lte: mostRecentNoon,
              // 실시간 업데이트 버전
              gte: mostRecentNoon,
              lte: new Date(),
            },
          },
        },
      },
      orderBy: {
        reviewLikeTb: {
          _count: 'desc',
        },
      },
    });

    const hotReviews = reviewData.map((review) => new ReviewListEntity(review));

    await this.cacheManager.set('hotReviews', hotReviews, 12 * 3600 * 1000);
  }

  @Cron(' 0 0 0,12 * * *')
  async setColdReviewAll(): Promise<void> {
    const mostRecentNoon = this.getMostRecentNoon();

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            commentTb: true,
            reviewLikeTb: true,
            reviewDislikeTb: true,
          },
        },
      },
      where: {
        reviewDislikeTb: {
          some: {
            createdAt: {
              // 12시간마다 업데이트 버전
              // gte: new Date(mostRecentNoon.getTime() - 12 * 60 * 60 * 1000),
              // lte: mostRecentNoon,
              // 실시간 업데이트 버전
              gte: mostRecentNoon,
              lte: new Date(),
            },
          },
        },
      },
      orderBy: {
        reviewDislikeTb: {
          _count: 'desc',
        },
      },
    });

    const coldReviews = reviewData.map(
      (review) => new ReviewListEntity(review),
    );

    await this.cacheManager.set('coldReviews', coldReviews, 12 * 3600 * 1000);
  }

  async getHotReviewAll(
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const hotReviews =
      await this.cacheManager.get<Array<ReviewEntity>>('hotReviews');

    if (!hotReviews) {
      return {
        totalPage: 0,
        reviews: [],
      };
    }

    const startIndex = reviewPagerbleDto.size * (reviewPagerbleDto.page - 1);

    return {
      totalPage: Math.ceil(hotReviews.length / reviewPagerbleDto.size),
      reviews: hotReviews.slice(
        startIndex,
        startIndex + reviewPagerbleDto.size,
      ),
    };
  }

  async getColdReviewAll(
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const coldReviews =
      await this.cacheManager.get<Array<ReviewEntity>>('coldReviews');

    if (!coldReviews) {
      return {
        totalPage: 0,
        reviews: [],
      };
    }

    const startIndex = reviewPagerbleDto.size * (reviewPagerbleDto.page - 1);

    return {
      totalPage: Math.ceil(coldReviews.length / reviewPagerbleDto.size),
      reviews: coldReviews.slice(
        startIndex,
        startIndex + reviewPagerbleDto.size,
      ),
    };
  }

  async getMyCommentedReviewAll(
    userIdx: string,
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const user = await this.userService.getUser({ idx: userIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        commentTb: {
          some: {
            accountIdx: userIdx,
            deletedAt: null,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            reviewLikeTb: true,
            reviewDislikeTb: true,
            commentTb: true,
          },
        },
      },
      where: {
        commentTb: {
          some: {
            accountIdx: userIdx,
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

    return {
      totalPage: Math.ceil(totalCount / reviewPagerbleDto.size),
      reviews: reviewData.map((elem) => new ReviewListEntity(elem)),
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

  async getReviewLikedAll(
    userIdx: string,
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        reviewLikeTb: {
          some: {
            accountIdx: userIdx,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        tagTb: true,
        reviewImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            reviewLikeTb: true,
            reviewDislikeTb: true,
            commentTb: true,
          },
        },
      },
      where: {
        reviewLikeTb: {
          some: {
            accountIdx: userIdx,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (reviewPagerbleDto.page - 1) * reviewPagerbleDto.size,
      take: reviewPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / reviewPagerbleDto.size),
      reviews: reviewData.map((elem) => new ReviewListEntity(elem)),
    };
  }

  async onModuleInit() {
    this.logger.log('setHotReviewAll Method Start');
    this.logger.log('setColdReviewAll() Method Start');

    await this.setHotReviewAll();
    await this.setColdReviewAll();
  }
}
