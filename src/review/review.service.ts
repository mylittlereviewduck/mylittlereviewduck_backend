import {
  ConsoleLogger,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { UserService } from 'src/user/user.service';
import { Cron } from '@nestjs/schedule';
import { ReviewPagerbleDto } from './dto/review-pagerble.dto';
import { GetReviewWithSearchDto } from './dto/get-review-with-search.dto';
import { DEFAULT_REDIS, RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { GetLatestReveiwsByUserIdxsDto } from './dto/get-latest-reviews-by-userIdxs.dto';
import { UserFollowService } from 'src/user/user-follow.service';
import { GetReviewsWithUserStatusDto } from './dto/get-reviews-with-user-status.dto';
import { ReviewLikeCheckService } from './review-like-check.service';
import { UserBlockCheckService } from 'src/user/user-block-check.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { ReviewWithUserStatusService } from './review-with-user-status.service';
import { GetReviewsAllDto } from './dto/get-reviews-all.dto';

@Injectable()
export class ReviewService {
  private readonly redis: Redis | null;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly userFollowService: UserFollowService,
    private readonly reviewWithUserStatusService: ReviewWithUserStatusService,
  ) {
    this.redis = this.redisService.getOrThrow(DEFAULT_REDIS);

    setInterval(
      async () => {
        const keys = await this.redis.keys(`review:*:viewCount`);
        const batchSize = 100;

        for (let i = 0; i < keys.length; i += batchSize) {
          const batchKeys = keys.slice(i, i + batchSize);

          const updates = batchKeys.map(async (key) => {
            const reviewIdx = key.split(':')[1];
            const viewCount = await this.redis.get(key);
            await this.prismaService.reviewTb.update({
              where: {
                idx: parseInt(reviewIdx, 10),
              },
              data: {
                viewCount: parseInt(viewCount, 10),
              },
            });
            await this.redis.del(key);
          });
          Promise.all(updates);
        }
      },
      10 * 60 * 1000,
    );
  }

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
        idx: reviewIdx,
      },
    });

    if (!review) {
      return null;
    }

    return new ReviewEntity(review);
  }

  async getReviewsByIdx(reviewIdxs: number[]): Promise<ReviewEntity[]> {
    let reviews = await this.prismaService.reviewTb.findMany({
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
        idx: {
          in: reviewIdxs,
        },
      },
    });

    // reviews를 reviewIdxs 순서대로 정렬
    const reviewsMap = new Map(reviews.map((review) => [review.idx, review]));
    const sortedReviews = reviewIdxs.map((idx) => reviewsMap.get(idx));

    return sortedReviews.map((review) => new ReviewEntity(review));
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
        ...(dto.userIdx && { accountIdx: dto.userIdx }),
        ...(dto.userIdxs && { accountIdx: { in: dto.userIdxs } }),
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
        ...(dto.userIdx && { accountIdx: dto.userIdx  } ),
        ...(dto.userIdxs && { accountIdx: { in: dto.userIdxs } }),
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

  async getLatestReviewsByFollowing(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const followList = await this.userFollowService.getFollowingUsersIdx({
      userIdx: dto.userIdx,
    });

    return await this.getReviewsAll({
      page: dto.page,
      size: dto.size,
      timeframe: dto.timeframe,
      userIdxs: followList.followingIdxs,
    });
  }

  async increaseViewCount(reviewIdx: number): Promise<void> {
    await this.redis.incr(`review:${reviewIdx}:viewCount`);
  }

  async getViewCount(reviewIdx: number): Promise<number> {
    let viewCount = parseInt(
      await this.redis.get(`review:${reviewIdx}:viewCount`),
      10,
    );
    if (!viewCount) {
      const review = await this.getReviewByIdx(reviewIdx);
      viewCount = review.viewCount;

      await this.redis.set(`review:${reviewIdx}:viewCount`, viewCount);
    }

    return viewCount;
  }

  async getLatestReviewsByUsers(
    dto: GetLatestReveiwsByUserIdxsDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        accountIdx: {
          in: dto.userIdxs,
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
        accountIdx: {
          in: dto.userIdxs,
        },
      },
      skip: dto.page * dto.size,
      take: dto.size,
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
    };
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

    await this.redis.set('hotReviews', JSON.stringify(hotReviews));
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

    await this.redis.set('coldReviews', JSON.stringify(coldReviews));
  }

  async getHotReviewAll(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const hotReviews = JSON.parse(
      await this.redis.get('hotReviews'),
    ) as Array<ReviewEntity>;

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
    const coldReviews = JSON.parse(
      await this.redis.get('coldReviews'),
    ) as Array<ReviewEntity>;

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

  //기존 135ms
  //100-110ms로 개선
  async getReviewsWithUserStatus(
    dto: GetReviewsWithUserStatusDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getReviewsAll({
      page: dto.page,
      size: dto.size,
      timeframe: dto.timeframe,
      ...(dto.userIdx && { userIdx: dto.userIdx }),
    });

    if (!dto.loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    // await this.reviewLikeCheckService.isReviewLiked(
    //   dto.loginUserIdx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.reviewLikeCheckService.isReviewDisliked(
    //   dto.loginUserIdx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.reviewBlockCheckService.isReviewBlocked(
    //   dto.loginUserIdx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.userBlockCheckService.isBlockedUser(
    //   dto.loginUserIdx,
    //   reviewPagerbleResponseDto.reviews.map((elem) => elem.user),
    // );

    const userStatuses = await this.reviewWithUserStatusService.getUserStatus(
      dto.loginUserIdx,
      reviewPagerbleResponseDto.reviews.map((review) => review.idx),
      null,
    );

    const statusMap = new Map(
      userStatuses.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews = reviewPagerbleResponseDto.reviews.map(
      (review) => {
        const userStatus = statusMap.get(review.idx);
        if (userStatus) {
          review.isMyLike = userStatus.isMyLike;
          review.isMyDislike = userStatus.isMyDislike;
          review.isMyBookmark = userStatus.isMyBookmark;
          review.isMyBlock = userStatus.isMyBlock;
        }
        return review;
      },
    );

    return reviewPagerbleResponseDto;
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

  async onModuleInit() {
    this.logger.log('setHotReviewAll Method Start');
    this.logger.log('setColdReviewAll() Method Start');

    await this.setHotReviewAll();
    await this.setColdReviewAll();
  }
}
