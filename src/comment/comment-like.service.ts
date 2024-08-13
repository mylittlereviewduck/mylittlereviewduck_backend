import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentService } from './comment.service';
import { CommentLikeEntity } from './entity/CommentLike.entity';

@Injectable()
export class CommentLikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commentService: CommentService,
  ) {}

  async likeComment(
    userIdx: number,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<CommentLikeEntity> {
    const comment = await this.commentService.getComment(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
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
    userIdx: number,
    reviewIdx: number,
    commentIdx: number,
  ): Promise<void> {
    const comment = await this.commentService.getComment(reviewIdx, commentIdx);

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    await this.prismaService.commentLikesTb.deleteMany({
      where: {
        accountIdx: userIdx,
        commentIdx: commentIdx,
      },
    });
  }
}
