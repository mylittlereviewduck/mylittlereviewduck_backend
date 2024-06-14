import { Inject, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/CreateReview.dto';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewPagerbleDto } from './dto/ReviewPagerble.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
  ) {}

  async createReview(
    loginUser: any,
    createDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    //로그인한 유저도 엔티티로만들어야할까?
    //로그인한 유저는 user모듈에속할텐데 다른 모듈에서 로그인유저엔티티를 쓸 수 있을까?

    return;
  }

  updateMyReview: (reviewIdx: number, userIdx: number) => Promise<void>;

  deleteMyReview: (reviewIdx: number, userIdx: number) => Promise<void>;

  async getReviewAll(
    reviewPagerbleDto: ReviewPagerbleDto,
  ): Promise<ReviewEntity[]> {
    const reviewData = await this.prismaService.reviewTb.findMany({
      where: {
        accountIdx: reviewPagerbleDto.userIdx,
        idx: reviewPagerbleDto.reviewIdx,
      },
      orderBy:
        reviewPagerbleDto.orderby === 'createdAt'
          ? { createdAt: reviewPagerbleDto.sort }
          : undefined,
    });

    return reviewData.map((elem) => new ReviewEntity(elem));
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
