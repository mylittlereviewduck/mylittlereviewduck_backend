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
    private readonly commentService: CommentService,
    private readonly commentLikeCheckService: CommentLikeCheckService,
    private readonly reviewService: ReviewService,
  ) {}

  async likeComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<CommentLikeEntity> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException('Not Found Review');
    }
    const comment = await this.commentService.getCommentByIdx(commentIdx);

    if (!comment || comment.deletedAt !== null) {
      throw new NotFoundException('Not Found Comment');
    }

    let existingCommentLike = await this.commentLikeCheckService.isCommentLiked(
      userIdx,
      [comment],
    );

    if (existingCommentLike[0].isMyLike == true) {
      throw new ConflictException('Already Comment Like');
    }

    const commentLikeData = await this.prismaService.commentLikeTb.create({
      data: {
        accountIdx: userIdx,
        commentIdx: commentIdx,
      },
    });

    return new CommentLikeEntity(commentLikeData);
  }

  async unlikeComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<void> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const comment = await this.commentService.getCommentByIdx(commentIdx);

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

    await this.prismaService.commentLikeTb.deleteMany({
      where: {
        accountIdx: userIdx,
        commentIdx: commentIdx,
      },
    });
  }
}
