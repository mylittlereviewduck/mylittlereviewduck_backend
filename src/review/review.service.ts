import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ConsoleLogger,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/request/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/request/update-review.dto';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { UserService } from 'src/user/user.service';
import { Cron } from '@nestjs/schedule';
import { DEFAULT_REDIS, RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { ReviewInteractionService } from './review-interaction.service';
import { GetReviewsAllDto } from './dto/get-reviews-all.dto';
import { ReviewBookmarkService } from './review-bookmark.service';
import { GetReviewsWithSearchDto } from './dto/request/get-review-with-search.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ReviewPagerbleDto } from './dto/request/review-pagerble.dto';
import { GetScoreReviewsDto } from './dto/get-score-reviews.dto';

@Injectable()
export class ReviewService {
  private readonly redis: Redis | null;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly reviewBookmarkService: ReviewBookmarkService,
    private readonly eventEmitter: EventEmitter2,
    private readonly reviewInteractionService: ReviewInteractionService,
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

  async onModuleInit() {
    this.logger.log('cache HotReviewsHighScore()');
    this.logger.log('cache HotReviewsLowScore()');

    await this.cacheHotReviewsHighScore();
    await this.cacheHotReviewsLowScore();
  }

  async createReview(dto: CreateReviewDto): Promise<ReviewEntity> {
    let reviewData;

    reviewData = await this.prismaService.reviewTb.create({
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

      data: {
        accountIdx: dto.userIdx,
        title: dto.title,
        content: dto.content,
        score: dto.score,
        ...(dto.thumbnail && { thumbnail: dto.thumbnail }),
        ...(dto.thumbnailContent && { thumbnailContent: dto.thumbnailContent }),
        tagTb: {
          createMany: {
            data: dto.tags.map((tag) => {
              return {
                tagName: tag,
              };
            }),
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

  async updateReview(
    dto: UpdateReviewDto,
    loginUserIdx: string,
  ): Promise<ReviewEntity> {
    let data;

    await this.prismaService.$transaction(async (tx) => {
      const review = await this.getReviewByIdx(dto.reviewIdx);

      if (!review) {
        throw new NotFoundException('Not Found Review');
      }

      if (review.user.idx !== loginUserIdx) {
        throw new UnauthorizedException('Unauthorized User');
      }

      data = await tx.reviewTb.update({
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

        data: {
          title: dto.title,
          score: dto.score,
          content: dto.content,
          updatedAt: new Date(),
          ...(dto.thumbnail && { thumbnail: dto.thumbnail }),
          ...(dto.thumbnailContent && {
            thumbnailContent: dto.thumbnailContent,
          }),
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
          reviewImgTb: {
            deleteMany: {
              reviewIdx: dto.reviewIdx,
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

      where: {
        idx: reviewIdx,
        deletedAt: null,
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

  async getReviewDetail(
    reviewIdx: number,
    loginUserIdx: string | null,
  ): Promise<ReviewEntity> {
    const reviewEntity = await this.getReviewByIdx(reviewIdx);

    const viewCount = await this.getViewCount(reviewEntity.idx);

    reviewEntity.viewCount = viewCount + 1;
    await this.increaseViewCount(reviewEntity.idx);

    if (!loginUserIdx) {
      return reviewEntity;
    }

    const userStatus = await this.reviewInteractionService.getReviewInteraction(
      loginUserIdx,
      [reviewIdx],
      null,
    );

    if (userStatus[0]) {
      reviewEntity.isMyLike = userStatus[0].isMyLike;
      reviewEntity.isMyDislike = userStatus[0].isMyDislike;
      reviewEntity.isMyBookmark = userStatus[0].isMyBookmark;
      reviewEntity.isMyBlock = userStatus[0].isMyBlock;
    }

    return reviewEntity;
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

    // const now = new Date();
    // let startDate: Date;

    // if (dto.timeframe == '1D') {
    //   startDate = new Date(now.setHours(0, 0, 0, 0));
    //   startDate.setHours(0, 0, 0);
    // } else if (dto.timeframe == '7D') {
    //   startDate = new Date(now.setDate(now.getDate() - 6));
    //   startDate.setHours(0, 0, 0);
    // } else if (dto.timeframe == '1M') {
    //   startDate = new Date(now.setMonth(now.getMonth() - 1));
    //   startDate.setHours(0, 0, 0);
    // } else if (dto.timeframe == '1Y') {
    //   startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    //   startDate.setHours(0, 0, 0);
    // } else {
    //   startDate = new Date(0);
    // }

    const reviewCount = await this.prismaService.reviewTb.count({
      where: {
        ...(dto.userIdx && { accountIdx: dto.userIdx }),
        ...(dto.userIdxs && { accountIdx: { in: dto.userIdxs } }),
        ...(dto.scoreLte && { score: { lte: dto.scoreLte } }),
        ...(dto.scoreGte && { score: { gte: dto.scoreGte } }),
        ...(dto.following && {
          accountTb: {
            followers: {
              some: {
                followerIdx: dto.following,
              },
            },
          },
        }),
        // createdAt: {
        //   gte: startDate,
        // },
        deletedAt: null,
      },
    });

    const reviewSQLResult = await this.prismaService.reviewTb.findMany({
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
      where: {
        // prettier-ignore
        ...(dto.userIdx && { accountIdx: dto.userIdx  } ),
        ...(dto.userIdxs && { accountIdx: { in: dto.userIdxs } }),
        ...(dto.scoreLte && { score: { lte: dto.scoreLte } }),
        ...(dto.scoreGte && { score: { gte: dto.scoreGte } }),
        ...(dto.following && {
          accountTb: {
            followers: {
              some: {
                followerIdx: dto.following,
              },
            },
          },
        }),
        // createdAt: {
        //   gte: startDate,
        // },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: dto.size,
      skip: (dto.page - 1) * dto.size,
    });

    return {
      totalPage: Math.ceil(reviewCount / dto.size),
      reviews: reviewSQLResult.map((elem) => new ReviewEntity(elem)),
    };
  }

  async getFollowingReviews(
    dto: GetReviewsDto,
    loginUserIdx: string,
  ): Promise<ReviewPagerbleResponseDto> {
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        accountTb: {
          followers: {
            some: {
              followerIdx: loginUserIdx,
            },
          },
        },
      },
      orderBy: {
        idx: 'desc',
      },
    });
    const skip = dto.page * dto.size;
    const take = dto.size;

    // const mainReviews: {
    //   idx: number;
    //   title: string;
    //   content: string;
    //   accountIdx: string;
    //   viewCount: number;
    //   score: number;
    //   thumbnail: string;
    //   thumbnailContent: string;
    //   createdAt: Date;
    //   updatedAt: Date;
    //   deletedAt: Date;
    //   likeCount: number;
    //   dislikeCount: number;
    //   bookmarkCount: number;
    //   commentCount: number;
    // }[] = await this.prismaService.$queryRaw/*<ReviewRow[]>*/ `
    //   WITH new_reviews AS (
    //     SELECT rt.*
    //     FROM review_tb rt
    //     WHERE rt.account_idx IN (
    //       SELECT following_idx
    //       FROM follow_tb
    //       WHERE follower_idx = ${dto.loginUserIdx}
    //     )
    //     ORDER BY rt.created_at DESC
    //     LIMIT ${take}
    //     OFFSET ${skip}
    //   )
    //   SELECT
    //     nr.idx,
    //     nr.title,
    //     nr.content,
    //     nr.account_idx as "accountIdx",
    //     nr.view_count as "viewCount",
    //     nr.score,
    //     nr.thumbnail,
    //     nr.thumbnail_content as "thumbnailContent",
    //     nr.created_at as "createdAt",
    //     nr.updated_at as "updatedAt",
    //     nr.deleted_at as "deletedAt",
    //     CAST( COALESCE(rlt.like_count, 0) AS INTEGER) AS "likeCount",
    //     CAST( COALESCE(rdt.dislike_count, 0) AS INTEGER) AS "dislikeCount",
    //     CAST( COALESCE(rbt.bookmark_count, 0) AS INTEGER) AS "bookmarkCount",
    //     CAST( COALESCE(ct.comment_count, 0) AS INTEGER) AS "commentCount"
    //   FROM new_reviews nr
    //   LEFT JOIN (
    //     SELECT review_idx, COUNT(*) AS like_count
    //     FROM review_like_tb
    //     WHERE review_idx IN (SELECT idx FROM new_reviews)
    //     GROUP BY review_idx
    //   ) rlt ON nr.idx = rlt.review_idx
    //   LEFT JOIN (
    //     SELECT review_idx, COUNT(*) AS dislike_count
    //     FROM review_dislike_tb
    //     WHERE review_idx IN (SELECT idx FROM new_reviews)
    //     GROUP BY review_idx
    //   ) rdt ON nr.idx = rdt.review_idx
    //   LEFT JOIN (
    //     SELECT review_idx, COUNT(*) AS bookmark_count
    //     FROM review_bookmark_tb
    //     WHERE review_idx IN (SELECT idx FROM new_reviews)
    //     GROUP BY review_idx
    //   ) rbt ON nr.idx = rbt.review_idx
    //   LEFT JOIN (
    //     SELECT review_idx, COUNT(*) AS comment_count
    //     FROM comment_tb
    //     WHERE review_idx IN (SELECT idx FROM new_reviews)
    //     GROUP BY review_idx
    //   ) ct ON nr.idx = ct.review_idx
    //   ORDER BY nr.created_at DESC
    // `;

    // const accountIdxList = Array.from(
    //   new Set(mainReviews.map((r) => r.accountIdx)),
    // );

    // const reviewIdxList = Array.from(
    //   new Set(mainReviews.map((elem) => elem.idx)),
    // );

    // const accounts = await this.prismaService.accountTb.findMany({
    //   where: {
    //     idx: { in: accountIdxList },
    //   },
    // });

    // const tags = await this.prismaService.tagTb.findMany({
    //   where: {
    //     reviewIdx: { in: reviewIdxList },
    //   },
    // });

    // const reviewImgs = await this.prismaService.reviewImgTb.findMany({
    //   where: {
    //     reviewIdx: { in: reviewIdxList },
    //   },
    // });

    // const reviewData: Review[] = mainReviews.map((elem) => {
    //   return {
    //     ...elem,
    //     accountTb: accounts.find((account) => account.idx === elem.accountIdx),

    //     tagTb: tags.filter((tag) => tag.reviewIdx === elem.idx),

    //     reviewImgTb: reviewImgs.filter((img) => img.reviewIdx === elem.idx),
    //     _count: {
    //       commentTb: elem.commentCount,
    //       reviewLikeTb: elem.likeCount,
    //       reviewDislikeTb: elem.dislikeCount,
    //       reviewBookmarkTb: elem.bookmarkCount,
    //     },
    //   };
    // });

    const reviewData = await this.prismaService.reviewTb.findMany({
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
      where: {
        accountTb: {
          followers: {
            some: {
              followerIdx: loginUserIdx,
            },
          },
        },
      },
      take: dto.size,
      skip: (dto.page - 1) * dto.size,
      orderBy: { createdAt: 'desc' },
    });

    // return;
    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
    };
  }

  async getFollowingReviewsWithInteraction(
    dto: GetReviewsAllDto,
    loginUserIdx: string,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getReviewsAll({
      ...dto,
      following: loginUserIdx,
    });

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatus = await this.reviewInteractionService.getReviewInteraction(
      loginUserIdx,
      reviewIdxs,
      null,
    );

    const statusMap = new Map(
      userStatus.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
    });

    return reviewPagerbleResponseDto;
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
    dto: GetReviewsDto,
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

  async getReviewsWithSearch(
    dto: GetReviewsWithSearchDto,
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

  async getSearchedReviewsWithUserStatus(
    dto: GetReviewsWithSearchDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    let reviewPagerbleResponseDto = await this.getReviewsWithSearch({
      search: dto.search,
      size: dto.size,
      page: dto.page,
    });

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    this.eventEmitter.emit('search.review', dto.search, loginUserIdx);

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatus = await this.reviewInteractionService.getReviewInteraction(
      loginUserIdx,
      reviewIdxs,
    );

    const statusMap = new Map(
      userStatus.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
    });

    return reviewPagerbleResponseDto;
  }

  getMidnightDaysAgo(daysAgo: number): Date {
    const date = new Date();

    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  async getHotReviewsHighScore(
    start: Date,
    end: Date,
  ): Promise<ReviewEntity[]> {
    const reviewData = await this.prismaService.reviewTb.findMany({
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
      where: {
        reviewLikeTb: {
          some: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        score: {
          gte: 3,
        },
      },
      orderBy: {
        reviewLikeTb: {
          _count: 'desc',
        },
      },
      take: 100,
    });

    return reviewData.map((review) => new ReviewEntity(review));
  }

  async getHotReviewsLowScore(start: Date, end: Date): Promise<ReviewEntity[]> {
    const reviewData = await this.prismaService.reviewTb.findMany({
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
      where: {
        reviewDislikeTb: {
          some: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        score: {
          lte: 2,
        },
      },
      orderBy: {
        reviewLikeTb: {
          _count: 'desc',
        },
      },
      take: 100,
    });

    return reviewData.map((review) => new ReviewEntity(review));
  }

  // 700ms, 460ms 소요(캐싱, 인덱스 안했을경우)
  // (인덱싱 했을경우)
  // 메모리에 저장하는 함수, 12시간마다 실행되는 함수
  @Cron('0 0 0 * * *')
  async cacheHotReviewsHighScore(): Promise<void> {
    const endDay = new Date();

    const start1Day = this.getMidnightDaysAgo(1);
    const start7Day = this.getMidnightDaysAgo(7);
    const start30Day = this.getMidnightDaysAgo(30);
    endDay.setHours(0, 0, 0, 0);

    //prettier-ignore
    const hotReviewsHighScore1Day = await this.getHotReviewsHighScore(start1Day,endDay,);
    console.log('hotReviewsHighScore1Day: ', hotReviewsHighScore1Day);
    //prettier-ignore
    const hotReviewsHighScore7Day = await this.getHotReviewsHighScore(start7Day,endDay,);
    //prettier-ignore
    const hotReviewsHighScore30Day = await this.getHotReviewsHighScore(start30Day,endDay,);

    //prettier-ignore
    await this.redis.set('hotReviewsHighScore1Day', JSON.stringify(hotReviewsHighScore1Day));
    //prettier-ignore
    await this.redis.set('hotReviewsHighScore7Day', JSON.stringify(hotReviewsHighScore7Day));
    //prettier-ignore
    await this.redis.set('hotReviewsHighScore30Day', JSON.stringify(hotReviewsHighScore30Day));
  }

  @Cron('0 0 0 * * *')
  async cacheHotReviewsLowScore(): Promise<void> {
    const endDay = new Date();

    const start1Day = this.getMidnightDaysAgo(1);
    const start7Day = this.getMidnightDaysAgo(7);
    const start30Day = this.getMidnightDaysAgo(30);
    endDay.setHours(0, 0, 0, 0);

    //prettier-ignore
    const hotReviewsLowScore1Day = await this.getHotReviewsLowScore(start1Day, endDay);
    //prettier-ignore
    const hotReviewsLowScore7Day = await this.getHotReviewsLowScore(start7Day, endDay);
    //prettier-ignore
    const hotReviewsLowScore30Day = await this.getHotReviewsLowScore(start30Day, endDay);

    //prettier-ignore
    await this.redis.set('hotReviewsLowScore1Day', JSON.stringify(hotReviewsLowScore1Day));
    //prettier-ignore
    await this.redis.set('hotReviewsLowScore7Day', JSON.stringify(hotReviewsLowScore7Day));
    //prettier-ignore
    await this.redis.set('hotReviewsLowScore30Day', JSON.stringify(hotReviewsLowScore30Day));
  }

  //기간별조회기능 추가
  async getCachedHotReviewsHighScore(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const hotReviews = JSON.parse(
      await this.redis.get('hotReviewsHighScore1Day'),
    ) as Array<ReviewEntity>;
    console.log('hotReviews: ', hotReviews);

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

  async getCachedHotReviewsLowScore(
    dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const hotReviews = JSON.parse(
      await this.redis.get('hotReviewsLowScore'),
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

  //기존 135ms
  //100-110ms로 개선
  async getScoreReviewsWithInteraction(
    dto: GetScoreReviewsDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getReviewsAll({
      page: dto.page,
      size: dto.size,
      ...(dto.scoreLte && { scoreLte: dto.scoreLte }),
      ...(dto.scoreGte && { scoreGte: dto.scoreGte }),
    });

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const userStatuses =
      await this.reviewInteractionService.getReviewInteraction(
        loginUserIdx,
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

  async getReviewsByUserIdxWithInteraction(
    dto: GetReviewsDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getReviewsAll(dto);

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatuses =
      await this.reviewInteractionService.getReviewInteraction(
        loginUserIdx,
        reviewIdxs,
        null,
      );

    const statusMap = new Map(
      userStatuses.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
      return review;
    });

    return reviewPagerbleResponseDto;
  }

  async getBookmarkedReviewsWithInteraction(
    dto: GetReviewsDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto =
      await this.reviewBookmarkService.getBookmarkedReviewAll(dto);

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatuses =
      await this.reviewInteractionService.getReviewInteraction(
        loginUserIdx,
        reviewIdxs,
        null,
      );

    const statusMap = new Map(
      userStatuses.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
      return review;
    });

    return reviewPagerbleResponseDto;
  }

  async getCommentedReviews(
    dto: GetReviewsDto,
  ): Promise<ReviewPagerbleResponseDto> {
    const user = await this.userService.getUser({ idx: dto.userIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    // const countSQLResult: { count: bigint }[] = await this.prismaService
    //   .$queryRaw`
    //   SELECT count(*)
    //   FROM review_tb r
    //   JOIN comment_tb c ON r.idx = c.review_idx
    //   WHERE c.account_idx = ${dto.userIdx}
    //   AND r.deleted_at IS NULL;
    // `;

    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        deletedAt: null,
        commentTb: {
          some: {
            accountIdx: dto.userIdx,
          },
        },
      },
    });

    const reviewData = await this.prismaService.reviewTb.findMany({
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
      where: {
        commentTb: {
          some: {
            accountIdx: dto.userIdx,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reviews: reviewData.map((elem) => new ReviewEntity(elem)),
    };
  }

  async getCommentedReviewsWithInteraction(
    dto: GetReviewsDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getCommentedReviews({
      page: dto.page,
      size: dto.size,
      userIdx: dto.userIdx,
    });

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatuses =
      await this.reviewInteractionService.getReviewInteraction(
        loginUserIdx,
        reviewIdxs,
        null,
      );

    const statusMap = new Map(
      userStatuses.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
      return review;
    });
    // await this.reviewLikeCheckService.isReviewLiked(
    //   loginUser.idx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.reviewLikeCheckService.isReviewDisliked(
    //   loginUser.idx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.reviewBlockCheckService.isReviewBlocked(
    //   loginUser.idx,
    //   reviewPagerbleResponseDto.reviews,
    // );

    // await this.userBlockCheckService.isBlockedUser(
    //   loginUser.idx,
    //   reviewPagerbleResponseDto.reviews.map((elem) => elem.user),
    // );

    return reviewPagerbleResponseDto;
  }

  async getLikedReviews(
    dto: GetReviewsDto,
  ): Promise<ReviewPagerbleResponseDto> {
    //총숫자
    const totalCount = await this.prismaService.reviewTb.count({
      where: {
        reviewLikeTb: {
          every: {
            accountIdx: dto.userIdx,
          },
        },
      },
    });

    //리뷰페이지네이션 반환
    const reviewData = await this.prismaService.reviewTb.findMany({
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

  async getLikedReviewsWithInteraction(
    dto: GetReviewsDto,
    loginUserIdx: string | null,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.getLikedReviews({
      page: dto.page,
      size: dto.size,
      userIdx: dto.userIdx,
    });

    if (!loginUserIdx) {
      return reviewPagerbleResponseDto;
    }

    if (reviewPagerbleResponseDto.reviews.length === 0)
      return { totalPage: 0, reviews: [] };

    const reviewIdxs = reviewPagerbleResponseDto.reviews.map(
      (review) => review.idx,
    );

    const userStatuses =
      await this.reviewInteractionService.getReviewInteraction(
        loginUserIdx,
        reviewIdxs,
        null,
      );

    const statusMap = new Map(
      userStatuses.map((status) => [status.reviewIdx, status]),
    );

    reviewPagerbleResponseDto.reviews.map((review) => {
      const userStatus = statusMap.get(review.idx);
      if (userStatus) {
        review.isMyLike = userStatus.isMyLike;
        review.isMyDislike = userStatus.isMyDislike;
        review.isMyBookmark = userStatus.isMyBookmark;
        review.isMyBlock = userStatus.isMyBlock;
      }
      return review;
    });
  }

  getMostRecentNoon(): Date {
    const noon = new Date();

    // 현재 시간이 12시 이후인지 확인
    if (noon.getHours() >= 12) {
      // 오늘 12시 정각으로 설정
      noon.setHours(12, 0, 0, 0);
    } else {
      // 오늘 00시 정각으로 설정
      noon.setHours(0, 0, 0, 0);
    }

    return noon;
  }
}
