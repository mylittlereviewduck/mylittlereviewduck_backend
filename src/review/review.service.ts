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
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { UserService } from 'src/user/user.service';
import { Cron } from '@nestjs/schedule';
import { ReviewPagerbleDto } from './dto/review-pagerble.dto';
import { GetReviewWithSearchDto } from './dto/get-review-with-search.dto';
import { GetReviewsAllDto } from './dto/get-reviews-all.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly logger: ConsoleLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createReview(dto: CreateReviewDto): Promise<ReviewEntity> {
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
        reviewThumbnailTb: {
          where: {
            deletedAt: null,
          },
        },
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
        accountIdx: dto.userIdx,
        title: dto.title,
        content: dto.content,
        score: dto.score,
        tagTb: {
          createMany: {
            data: dto.tags.map((tag) => {
              return {
                tagName: tag,
              };
            }),
          },
        },
        reviewThumbnailTb: {
          create: {
            imgPath: dto.thumbnail,
            content: dto.content,
          },
        },
        reviewImgTb: {
          createMany: {
            data: dto.images.map((image) => ({
              imgPath: image.image,
              content: image.content,
            })),
          },
        },
      },
    });

    return new ReviewEntity(reviewData);
  }

  async updateReview(dto: UpdateReviewDto): Promise<ReviewEntity> {
    let data;

    await this.prismaService.$transaction(async (tx) => {
      const review = await this.getReviewByIdx(dto.reviewIdx);

      if (!review) {
        throw new NotFoundException('Not Found Review');
      }

      if (review.user.idx !== dto.userIdx) {
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
          reviewThumbnailTb: {
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
          title: dto.title,
          score: dto.score,
          content: dto.content,
          updatedAt: new Date(),

          tagTb: {
            deleteMany: {
              reviewIdx: dto.reviewIdx,
            },
            createMany: {
              data: dto.tags.map((tag) => {
                return {
                  tagName: tag,
                };
              }),
            },
          },
          reviewThumbnailTb: {
            updateMany: {
              data: {
                deletedAt: new Date(),
              },
              where: {
                idx: dto.reviewIdx,
              },
            },
            create: {
              imgPath: dto.thumbnail,
              content: dto.content,
            },
          },
          reviewImgTb: {
            updateMany: {
              data: {
                deletedAt: new Date(),
              },
              where: {
                reviewIdx: dto.reviewIdx,
              },
            },
            createMany: {
              data: dto.images.map((image) => ({
                imgPath: image.image,
                content: image.content,
              })),
            },
          },
        },
        where: {
          idx: dto.reviewIdx,
        },
      });
    });

    return new ReviewEntity(data);
  }

  async updateReviewThumbnail(
    reviewIdx: number,
    imgPath: string,
    content: string,
  ): Promise<void> {
    await this.prismaService.reviewThumbnailTb.updateMany({
      data: {
        deletedAt: new Date(),
      },
      where: {
        reviewIdx: reviewIdx,
      },
    });

    await this.prismaService.reviewThumbnailTb.create({
      data: {
        reviewIdx: reviewIdx,
        imgPath: imgPath,
        content: content,
      },
    });
  }

  async deleteThumbnailImg(reviewIdx: number): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          idx: reviewIdx,
        },
      }),
    ]);
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
    let review = await this.prismaService.reviewTb.findUnique({
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
          },
        },
      },

      where: {
        idx: reviewIdx,
      },
    });

    if (!review) {
      return null;
    }

    return new ReviewEntity(review);
  }

  async getReviewsAll(
    dto: GetReviewsAllDto,
  ): Promise<ReviewPagerbleResponseDto> {
    if (dto.userIdx) {
      const user = await this.userService.getUser({ idx: dto.userIdx });

      if (!user) {
        throw new NotFoundException('Not Found User');
      }
    }

    const now = new Date();
    let startDate: Date;

    if (dto.timeframe == '1D') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      startDate.setHours(0, 0, 0);
    } else if (dto.timeframe == '7D') {
      startDate = new Date(now.setDate(now.getDate() - 6));
      startDate.setHours(0, 0, 0);
    } else if (dto.timeframe == '1M') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      startDate.setHours(0, 0, 0);
    } else if (dto.timeframe == '1Y') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      startDate.setHours(0, 0, 0);
    } else {
      startDate = new Date(0);
    }

    const reviewCount = await this.prismaService.reviewTb.count({
      where: {
        //문법공부
        ...(dto.userIdx ? { accountIdx: dto.userIdx } : {}),
        createdAt: {
          gte: startDate,
        },
        deletedAt: null,
      },
    });

    const reviewSQLResult = await this.prismaService.reviewTb.findMany({
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
          },
        },
      },
      where: {
        // prettier-ignore
        ...(dto.userIdx ? { accountIdx: dto.userIdx  } : {}),
        createdAt: {
          gte: startDate,
        },
        deletedAt: null,
      },
      orderBy: {
        idx: 'desc',
      },
      take: dto.size,
      skip: (dto.page - 1) * dto.size,
    });

    return {
      totalPage: Math.ceil(reviewCount / dto.size),
      reviews: reviewSQLResult.map((elem) => new ReviewEntity(elem)),
    };
  }

  async increaseViewCount(reviewIdx: number): Promise<void> {
    await this.prismaService.reviewTb.update({
      where: {
        idx: reviewIdx,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async getReviewWithSearch(
    dto: GetReviewWithSearchDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        OR: [
          {
            title: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
          {
            accountTb: {
              nickname: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
          },
          {
            tagTb: {
              some: {
                tagName: {
                  contains: dto.search,
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
          },
        },
      },
      where: {
        OR: [
          {
            title: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
          {
            accountTb: {
              nickname: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
          },
          {
            tagTb: {
              some: {
                tagName: {
                  contains: dto.search,
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
      take: dto.size,
      skip: dto.size * (dto.page - 1),
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
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

    const hotReviews = reviewData.map((review) => new ReviewEntity(review));

    await this.cacheManager.set('hotReviews', hotReviews, 12 * 3600 * 1000);
  }

  @Cron(' 0 0 0,12 * * *')
  async setColdReviewAll(): Promise<void> {
    const mostRecentNoon = this.getMostRecentNoon();

    const reviewData = await this.prismaService.reviewTb.findMany({
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
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

    const coldReviews = reviewData.map((review) => new ReviewEntity(review));

    await this.cacheManager.set('coldReviews', coldReviews, 12 * 3600 * 1000);
  }

  async getHotReviewAll(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const hotReviews =
      await this.cacheManager.get<Array<ReviewEntity>>('hotReviews');

    if (!hotReviews) {
      return {
        totalPage: 0,
        reviews: [],
      };
    }

    const startIndex = dto.size * (dto.page - 1);

    return {
      totalPage: Math.ceil(hotReviews.length / dto.size),
      reviews: hotReviews.slice(startIndex, startIndex + dto.size),
    };
  }

  async getColdReviewAll(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const coldReviews =
      await this.cacheManager.get<Array<ReviewEntity>>('coldReviews');

    if (!coldReviews) {
      return {
        totalPage: 0,
        reviews: [],
      };
    }

    const startIndex = dto.size * (dto.page - 1);

    return {
      totalPage: Math.ceil(coldReviews.length / dto.size),
      reviews: coldReviews.slice(startIndex, startIndex + dto.size),
    };
  }

  async getReviewsCommented(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const user = await this.userService.getUser({ idx: dto.userIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const countSQLResult: { count: bigint }[] = await this.prismaService
      .$queryRaw`
      SELECT count(*)
      FROM review_tb r
      JOIN comment_tb c ON r.idx = c.review_idx
      WHERE c.account_idx = ${dto.userIdx}
      AND r.deleted_at IS NULL;
    `;

    // 왜안되는지 공부
    // const totalCount2 = await this.prismaService.reviewTb.count({
    //   where: {
    //     deletedAt: null,
    //     commentTb: {
    //       some: {
    //         accountIdx: dto.userIdx,
    //       },
    //     },
    //   },
    // });
    // console.log('totalCount2: ', totalCount2);

    const totalCount: number = Number(countSQLResult[0].count);

    const reviewData = await this.prismaService.reviewTb.findMany({
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
          },
        },
      },
      where: {
        commentTb: {
          some: {
            accountIdx: dto.userIdx,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
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

  //쿼리수정해야됨
  async getReviewLikedAll(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        reviewLikeTb: {
          some: {
            accountIdx: dto.userIdx,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
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
        reviewThumbnailTb: {
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
            reviewShareTb: true,
          },
        },
      },
      where: {
        reviewLikeTb: {
          some: {
            accountIdx: dto.userIdx,
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
    };
  }

  async onModuleInit() {
    this.logger.log('setHotReviewAll Method Start');
    this.logger.log('setColdReviewAll() Method Start');

    await this.setHotReviewAll();
    await this.setColdReviewAll();
  }
}
