import { Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentLikeCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  async isCommentLiked(
    loginUser: LoginUser,
    commentIdx: number,
  ): Promise<boolean> {
    const isLiked = await this.prismaService.commentLikesTb.findUnique({
      where: {
        commentIdx_accountIdx: {
          accountIdx: loginUser.idx,
          commentIdx: commentIdx,
        },
      },
    });
    console.log('isLiked: ', isLiked);

    return;
  }
}
