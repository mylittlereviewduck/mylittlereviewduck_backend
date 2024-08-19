import { CommentPagerbleResponseDto } from './dto/response/comment-pagerble-response.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentEntity } from './entity/Comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewService } from 'src/review/review.service';
import { CommentPagerbleDto } from './dto/comment-pagerble.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async getCommentByIdx(
    reviewIdx: number,
    commentIdx: number,
  ): Promise<CommentEntity> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const comment = await this.prismaService.commentTb.findUnique({
      where: {
        idx: commentIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!comment) {
      return;
    }

    const commentData = {
      ...comment,
      userIdx: comment.accountIdx,
    };

    return new CommentEntity(commentData);
  }

  async getCommentAll(
    commentPagerbleDto: CommentPagerbleDto,
  ): Promise<CommentPagerbleResponseDto> {
    const review = await this.reviewService.getReviewByIdx(
      commentPagerbleDto.reviewIdx,
    );

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const totalCount = await this.prismaService.commentTb.count({
      where: {
        reviewIdx: commentPagerbleDto.reviewIdx,
      },
    });

    const commentData = await this.prismaService.commentTb.findMany({
      include: {
        accountTb: true,
      },
      where: {
        reviewIdx: commentPagerbleDto.reviewIdx,
        deletedAt: {
          equals: null,
        },
      },
    });

    return {
      totalPage: Math.ceil(totalCount / commentPagerbleDto.size),
      comments: commentData.map((elem) => new CommentEntity(elem)),
    };
  }

  async createComment(
    userIdx: string,
    reviewIdx: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const review = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const commentData = await this.prismaService.commentTb.create({
      data: {
        reviewIdx: reviewIdx,
        accountIdx: userIdx,
        content: createCommentDto.content,
        commentIdx: createCommentDto.commentIdx,
      },
    });

    return new CommentEntity(commentData);
  }

  async updateComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const comment = await this.getCommentByIdx(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    if (comment.userIdx !== userIdx) {
      throw new UnauthorizedException('Unauthorized User');
    }

    const commentData = await this.prismaService.commentTb.update({
      data: {
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
      where: {
        idx: commentIdx,
      },
    });

    return new CommentEntity(commentData);
  }

  async deleteComment(
    userIdx: string,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<CommentEntity> {
    const comment = await this.getCommentByIdx(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    if (comment.userIdx !== userIdx) {
      throw new UnauthorizedException('Unauthorized');
    }

    const deletedCommentData = await this.prismaService.commentTb.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        idx: commentIdx,
        accountIdx: userIdx,
      },
    });
    return new CommentEntity(deletedCommentData);
  }
}
