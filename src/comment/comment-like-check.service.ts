import { Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentEntity } from './entity/Comment.entity';

@Injectable()
export class CommentLikeCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isCommentLiked(
    userIdx: string,
    comments: CommentEntity[],
  ): Promise<CommentEntity[]> {
    const sqlResult = await this.prismaService.commentLikeTb.findMany({
      where: {
        accountIdx: userIdx,
        commentIdx: {
          in: comments.map((elem) => elem.idx),
        },
      },
      select: {
        commentIdx: true,
      },
    });

    const likedCommentList = sqlResult.map((elem) => elem.commentIdx);

    for (let i = 0; i < comments.length; i++) {
      if (likedCommentList.includes(comments[i].idx)) {
        comments[i].isMyLike = true;
      }
    }

    return comments;
  }
}
