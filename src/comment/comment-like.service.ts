import { CommentLikeCheckService } from './comment-like-check.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentService } from './comment.service';
import { CommentLikeEntity } from './entity/CommentLike.entity';
import { ReviewService } from 'src/review/review.service';

@Injectable()
export class CommentLikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly commentService: CommentService,
    private readonly commentLikeCheckService: CommentLikeCheckService,
  ) {}

  async likeComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<CommentLikeEntity> {
    const review = await this.reviewService.getReviewWithIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const comment = await this.commentService.getComment(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    let existingCommentLike = await this.commentLikeCheckService.isCommentLiked(
      userIdx,
      [comment],
    );

    if (existingCommentLike[0].isMyLike == true) {
      throw new ConflictException('Already Comment Like');
    }

    await this.prismaService.commentLikesTb.create({
      data: {
        accountIdx: userIdx,
        commentIdx: commentIdx,
      },
    });

    return;
  }

  async unlikeComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<void> {
    const review = await this.reviewService.getReviewWithIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const comment = await this.commentService.getComment(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    let existingCommentLike = await this.commentLikeCheckService.isCommentLiked(
      userIdx,
      [comment],
    );

    if (existingCommentLike[0].isMyLike == false) {
      throw new ConflictException('Already Not Comment Like');
    }

    await this.prismaService.commentLikesTb.deleteMany({
      where: {
        accountIdx: userIdx,
        commentIdx: commentIdx,
      },
    });
  }
}
