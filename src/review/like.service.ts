import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from './review.service';
import { ReviewLikeEntity } from './entity/ReviewLike.entity';
import { ReviewDislikeEntity } from './entity/ReviewDislike.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReviewLikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getReviewLike(
    userIdx: string,
    reviewIdx: number,
  ): Promise<ReviewLikeEntity | null> {
    const reviewLikeData = await this.prismaService.reviewLikeTb.findUnique({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });

    if (!reviewLikeData) {
      return null;
    }

    return new ReviewLikeEntity(reviewLikeData);
  }

  async getReviewDislike(
    userIdx: string,
    reviewIdx: number,
  ): Promise<ReviewDislikeEntity | null> {
    const reviewDislikeData =
      await this.prismaService.reviewDislikeTb.findUnique({
        where: {
          accountIdx_reviewIdx: {
            accountIdx: userIdx,
            reviewIdx: reviewIdx,
          },
        },
      });

    if (!reviewDislikeData) {
      return null;
    }

    return new ReviewDislikeEntity(reviewDislikeData);
  }

  async likeReview(
    userIdx: string,
    reviewIdx: number,
  ): Promise<ReviewLikeEntity> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.getReviewLike(userIdx, reviewIdx);

    if (existingLike) {
      throw new ConflictException('Already Review Like');
    }

    const existingDisLike = await this.getReviewDislike(userIdx, reviewIdx);

    if (existingDisLike) {
      await this.undislikeReview(userIdx, reviewIdx);
    }
    const reviewLikeData = await this.prismaService.reviewLikeTb.create({
      data: {
        accountIdx: userIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (userIdx != review.user.idx) {
      this.eventEmitter.emit('notification.create', {
        senderIdx: userIdx,
        recipientIdx: review.user.idx,
        type: 2,
        reviewIdx: review.idx,
      });
    }

    return new ReviewLikeEntity(reviewLikeData);
  }

  async unlikeReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingLike = await this.getReviewLike(userIdx, reviewIdx);

    if (!existingLike) {
      throw new ConflictException('Already Not Review Like');
    }

    await this.prismaService.reviewLikeTb.delete({
      where: {
        reviewIdx_accountIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }

  async dislikeReview(
    userIdx: string,
    reviewIdx: number,
  ): Promise<ReviewDislikeEntity> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingDislike = await this.getReviewDislike(userIdx, reviewIdx);

    if (existingDislike) {
      throw new ConflictException('Already Review DisLike');
    }

    const existingLike = await this.getReviewLike(userIdx, reviewIdx);

    if (existingLike) {
      await this.unlikeReview(userIdx, reviewIdx);
    }

    const reviewDislikeEntity = await this.prismaService.reviewDislikeTb.create(
      {
        data: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    );

    return new ReviewDislikeEntity(reviewDislikeEntity);
  }

  async undislikeReview(userIdx: string, reviewIdx: number): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const existingDislike = await this.getReviewDislike(userIdx, reviewIdx);

    if (!existingDislike) {
      throw new ConflictException('Already Not Review Dislike');
    }

    await this.prismaService.reviewDislikeTb.delete({
      where: {
        accountIdx_reviewIdx: {
          accountIdx: userIdx,
          reviewIdx: reviewIdx,
        },
      },
    });
  }
}
