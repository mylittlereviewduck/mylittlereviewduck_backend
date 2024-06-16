import { Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentLikeService {
  constructor(private readonly prismaService: PrismaService) {}

  async likeComment(loginUser: LoginUser, commentIdx: number): Promise<void> {
    await this.prismaService.commentLikesTb.create({
      data: {
        accountIdx: loginUser.idx,
        commentIdx: commentIdx,
      },
    });
  }

  async unlikeComment(loginUser: LoginUser, commentIdx: number): Promise<void> {
    await this.prismaService.commentLikesTb.deleteMany({
      where: {
        accountIdx: loginUser.idx,
        commentIdx: commentIdx,
      },
    });
  }
}
