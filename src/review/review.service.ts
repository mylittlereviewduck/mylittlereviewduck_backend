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

@Injectable()
export class ReviewService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
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

      console.log(reviewData);

      await tx.tagTb.createMany({
        data: createDto.tags.map((tag) => ({
          reviewIdx: reviewData.idx,
          tagName: tag,
        })),
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
    const review = await this.prismaService.reviewTb.findUnique({
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
    const reviewData = this.prismaService.reviewTb.update({
      data: {
        title: updateReviewDto.title,
        score: updateReviewDto.score,
        content: updateReviewDto.content,
      },
      where: {
        idx: reviewIdx,
      },
    });

    return new ReviewEntity(reviewData);
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

  async getReviewAll(
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<{ review: ReviewEntity[]; totalPage: number }> {
    const reviewData = await this.prismaService.reviewTb.findMany({
      where: {
        accountIdx: reviewPagerbleDto.userIdx,
        idx: reviewPagerbleDto.reviewIdx,
      },
      orderBy:
        reviewPagerbleDto.orderby === 'createdAt'
          ? { createdAt: reviewPagerbleDto.sort }
          : undefined,
      include: { _count: true },
    });
    reviewData.map((elem) => new ReviewEntity(elem));
    return;
  }

  // 특정유저가 북마크한 리뷰 가져오기
  async getBookmarkedReviewAll(
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewEntity[]> {
    const reviewList = await this.prismaService.reviewTb.findMany({
      where: {
        accountIdx: reviewPagerbleDto.userIdx,
        commentTb: reviewPagerbleDto['like-user']
          ? { some: { accountIdx: reviewPagerbleDto.userIdx } }
          : undefined,
        bookmarkTb: reviewPagerbleDto['bookmark-user']
          ? { some: { accountIdx: reviewPagerbleDto.userIdx } }
          : undefined,
      },
    });

    return reviewList.map((elem) => new ReviewEntity(elem));
  }

  // 좋아요많은 순서로 리뷰가져오기
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
