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
import { SseService } from 'src/notification/sse.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly sseService: SseService,
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
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        _count: {
          select: {
            commentLikeTb: true,
          },
        },
      },
      where: {
        idx: commentIdx,
        reviewIdx: reviewIdx,
      },
    });

    if (!comment) {
      return;
    }

    return new CommentEntity(comment);
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
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        _count: {
          select: {
            commentLikeTb: true,
          },
        },
      },
      where: {
        reviewIdx: commentPagerbleDto.reviewIdx,
        deletedAt: {
          equals: null,
        },
      },
      take: commentPagerbleDto.size,
      skip: (commentPagerbleDto.page - 1) * commentPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / commentPagerbleDto.size),
      comments: commentData.map((comment) => new CommentEntity(comment)),
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
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        _count: {
          select: {
            commentLikeTb: true,
          },
        },
      },
      data: {
        reviewIdx: reviewIdx,
        accountIdx: userIdx,
        content: createCommentDto.content,
        commentIdx: createCommentDto.commentIdx,
      },
    });

    this.sseService.createSSE(userIdx);

    return new CommentEntity(commentData);
  }

  //댓글 수정시 없는 댓글요청시 서버에러나는거 수정해야함
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

    if (comment.user.idx !== userIdx) {
      throw new UnauthorizedException('Unauthorized User');
    }

    const commentData = await this.prismaService.commentTb.update({
      include: {
        accountTb: {
          include: {
            profileImgTb: true,
          },
        },
        _count: {
          select: {
            commentLikeTb: true,
          },
        },
      },
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
  ): Promise<void> {
    const comment = await this.getCommentByIdx(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    if (comment.user.idx !== userIdx) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prismaService.commentTb.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        idx: commentIdx,
        accountIdx: userIdx,
      },
    });

    return;
  }
}
